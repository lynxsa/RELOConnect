import 'jest';

// Global test setup
beforeAll(async () => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/reloconnect_test';
  
  // Mock console methods to reduce noise in test output
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(async () => {
  // Cleanup after all tests
});

// Mock external services
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../src/services/ocrService', () => ({
  extractDocumentData: jest.fn().mockResolvedValue({
    type: 'ID_DOCUMENT',
    data: {
      idNumber: '1234567890123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
    },
    confidence: 0.95,
  }),
}));

jest.mock('../src/services/backgroundCheckService', () => ({
  performBackgroundCheck: jest.fn().mockResolvedValue({
    passed: true,
    score: 85,
    checks: {
      criminalRecord: 'CLEAR',
      creditCheck: 'GOOD',
      drivingRecord: 'CLEAN',
    },
  }),
}));

// Mock file uploads
global.mockFileBuffer = Buffer.from('mock-file-content');
global.mockImageBuffer = Buffer.from('mock-image-content');
