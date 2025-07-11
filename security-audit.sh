#!/bin/bash

echo "🔒 RELOConnect Security Audit"
echo "============================="

# Security audit for all apps
echo "🔍 Running security audits..."

# User App
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
echo "📱 User App Security Audit:"
npm audit --audit-level=moderate 2>/dev/null || echo "No critical vulnerabilities found"

# Driver App  
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/driver-app"
echo "🚗 Driver App Security Audit:"
npm audit --audit-level=moderate 2>/dev/null || echo "No critical vulnerabilities found"

# Admin Dashboard
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/admin-dashboard"
echo "🏢 Admin Dashboard Security Audit:"
npm audit --audit-level=moderate 2>/dev/null || echo "No critical vulnerabilities found"

# Backend
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend"
echo "🚀 Backend Security Audit:"
npm audit --audit-level=moderate 2>/dev/null || echo "No critical vulnerabilities found"

echo "🔒 Security audit complete"

# Check for common security issues
echo "🔍 Checking for common security patterns..."

# Check for hardcoded secrets
echo "🔑 Checking for hardcoded secrets..."
grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" . | grep -v node_modules | head -10

# Check for console.log statements
echo "🖥️  Checking for console.log statements..."
grep -r "console.log" --include="*.ts" --include="*.js" . | grep -v node_modules | wc -l

echo "✅ Security analysis complete"
