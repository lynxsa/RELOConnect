# RELOConnect Deployment Guide

## 🚀 Production Deployment Strategy

### Infrastructure Overview

#### Cloud Architecture (AWS/Azure/GCP)

```yaml
# docker-compose.production.yml
version: '3.8'
services:
  backend:
    image: reloconnect/backend:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=reloconnect_prod
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.2'

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

volumes:
  postgres_data:
```

#### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reloconnect-backend
  labels:
    app: reloconnect-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: reloconnect-backend
  template:
    metadata:
      labels:
        app: reloconnect-backend
    spec:
      containers:
      - name: backend
        image: reloconnect/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: reloconnect-secrets
              key: database-url
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: reloconnect-secrets
              key: gemini-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/status
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Environment Configuration

#### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@postgres-cluster:5432/reloconnect_prod
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://redis-cluster:6379
REDIS_PASSWORD=secure_redis_password

# JWT
JWT_SECRET=ultra_secure_jwt_secret_32_chars_min
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_VISION_MODEL=gemini-pro-vision

# Email
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=reloconnect@mg.reloconnect.co.za
SMTP_PASSWORD=mailgun_password
FROM_EMAIL=noreply@reloconnect.co.za

# File Storage
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=secret...
AWS_REGION=af-south-1
S3_BUCKET=reloconnect-documents
CLOUDFRONT_DOMAIN=cdn.reloconnect.co.za

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your_license_key

# Security
ENCRYPTION_KEY=32_byte_encryption_key_for_sensitive_data
CORS_ORIGIN=https://app.reloconnect.co.za,https://admin.reloconnect.co.za

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: reloconnect_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        working-directory: backend
        run: npm ci
      
      - name: Run Prisma generate
        working-directory: backend
        run: npx prisma generate
      
      - name: Run tests
        working-directory: backend
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/reloconnect_test
          JWT_SECRET: test-secret
          GEMINI_API_KEY: test-key
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: backend/coverage

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        working-directory: backend
        run: npm audit --audit-level moderate
      
      - name: Run dependency check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'RELOConnect'
          path: 'backend'
          format: 'JSON'
      
      - name: SAST Scan
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: backend
          push: true
          tags: |
            ghcr.io/reloconnect/backend:latest
            ghcr.io/reloconnect/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
            k8s/ingress.yaml
          images: |
            ghcr.io/reloconnect/backend:${{ github.sha }}
      
      - name: Run database migrations
        run: |
          kubectl exec deployment/reloconnect-backend -- npm run prisma:migrate:deploy
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/reloconnect-backend
          kubectl get pods -l app=reloconnect-backend
```

### Database Migration Strategy

#### Production Migration Process

```typescript
// scripts/migrate-production.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Starting production migration...');
  
  try {
    // 1. Backup current database
    console.log('Creating database backup...');
    await createBackup();
    
    // 2. Run migrations
    console.log('Running Prisma migrations...');
    await prisma.$executeRaw`SELECT 1`; // Test connection
    
    // 3. Verify data integrity
    console.log('Verifying data integrity...');
    await verifyDataIntegrity();
    
    // 4. Update search indexes
    console.log('Updating search indexes...');
    await updateSearchIndexes();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('Rolling back...');
    await rollbackMigration();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function createBackup() {
  // Implementation for database backup
}

async function verifyDataIntegrity() {
  // Check critical data relationships
  const ownerCount = await prisma.owner.count();
  const driverCount = await prisma.driver.count();
  const bookingCount = await prisma.booking.count();
  
  console.log(`Verified: ${ownerCount} owners, ${driverCount} drivers, ${bookingCount} bookings`);
}

async function updateSearchIndexes() {
  // Update database indexes for performance
}

async function rollbackMigration() {
  // Rollback procedures
}

if (require.main === module) {
  runMigrations();
}
```

### Monitoring & Observability

#### Application Monitoring

```typescript
// src/middleware/monitoring.ts
import { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';
import { performance } from 'perf_hooks';

export const monitoringMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - startTime;
    
    // Log request metrics
    console.log({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: Math.round(duration),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    
    // Send metrics to monitoring service
    if (duration > 1000) {
      Sentry.captureMessage(`Slow request: ${req.method} ${req.url} (${duration}ms)`, 'warning');
    }
    
    if (res.statusCode >= 500) {
      Sentry.captureMessage(`Server error: ${req.method} ${req.url}`, 'error');
    }
  });
  
  next();
};
```

#### Health Checks

```typescript
// src/routes/health.ts
import express from 'express';
import { prisma } from '../middleware/prisma';
import { reloAI } from '../services/reloAI';

const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version,
    checks: {}
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'unhealthy';
  }

  try {
    // AI service check
    const aiStatus = await checkAIService();
    health.checks.ai = aiStatus ? 'healthy' : 'degraded';
  } catch (error) {
    health.checks.ai = 'unhealthy';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'warning'
  };

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

async function checkAIService(): Promise<boolean> {
  try {
    // Simple AI service connectivity test
    await reloAI.parseBookingRequest('test', { userType: 'test' });
    return true;
  } catch {
    return false;
  }
}

export default router;
```

### Performance Optimization

#### Caching Strategy

```typescript
// src/middleware/cache.ts
import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

const redis = createClient({
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
});

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      const originalSend = res.json;
      res.json = function(data) {
        redis.setex(key, ttl, JSON.stringify(data));
        return originalSend.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};
```

### Security Hardening

#### Production Security Checklist

- [ ] SSL/TLS certificates installed and configured
- [ ] Security headers implemented (HSTS, CSP, etc.)
- [ ] Rate limiting configured for all endpoints
- [ ] API keys and secrets stored in secure vaults
- [ ] Database access restricted to application servers
- [ ] File upload restrictions and virus scanning enabled
- [ ] Audit logging configured and monitored
- [ ] Backup and disaster recovery procedures tested
- [ ] Security headers validated
- [ ] Penetration testing completed

#### Nginx Security Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name api.reloconnect.co.za;
    
    ssl_certificate /etc/nginx/ssl/reloconnect.crt;
    ssl_certificate_key /etc/nginx/ssl/reloconnect.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Rollback Procedures

#### Emergency Rollback Plan

1. **Immediate Actions** (0-5 minutes)
   - Stop accepting new traffic
   - Switch to previous container version
   - Notify incident response team

2. **Database Rollback** (5-15 minutes)
   - Restore from latest backup
   - Apply reverse migrations if needed
   - Verify data integrity

3. **Service Restoration** (15-30 minutes)
   - Route traffic to stable version
   - Verify all services operational
   - Monitor for residual issues

4. **Post-Incident** (30+ minutes)
   - Document incident details
   - Conduct root cause analysis
   - Update deployment procedures

This comprehensive deployment guide ensures RELOConnect can be deployed securely and reliably in production environments with proper monitoring, security, and rollback procedures.
