"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLORS = exports.VEHICLE_CLASSES = exports.APP_CONFIG = exports.SOCKET_EVENTS = exports.ERROR_CODES = exports.HTTP_STATUS = exports.API_ENDPOINTS = void 0;
// API Constants
exports.API_ENDPOINTS = {
    AUTH: '/api/auth',
    USERS: '/api/users',
    BOOKINGS: '/api/bookings',
    DRIVERS: '/api/drivers',
    PRICING: '/api/pricing',
    PAYMENTS: '/api/payments',
    NEWS: '/api/news',
    PORTS: '/api/ports',
    DONATIONS: '/api/donations',
};
// HTTP Status Codes
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
};
// Error Codes
exports.ERROR_CODES = {
    // Auth
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    PHONE_ALREADY_EXISTS: 'PHONE_ALREADY_EXISTS',
    // User
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_NOT_VERIFIED: 'USER_NOT_VERIFIED',
    // Booking
    BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
    INVALID_BOOKING_STATUS: 'INVALID_BOOKING_STATUS',
    NO_AVAILABLE_DRIVERS: 'NO_AVAILABLE_DRIVERS',
    // Driver
    DRIVER_NOT_FOUND: 'DRIVER_NOT_FOUND',
    DRIVER_NOT_AVAILABLE: 'DRIVER_NOT_AVAILABLE',
    INVALID_DRIVER_STATUS: 'INVALID_DRIVER_STATUS',
    // Payment
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
    // General
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
};
// Socket Events
exports.SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    // Booking Events
    BOOKING_CREATE: 'booking:create',
    BOOKING_UPDATE: 'booking:update',
    BOOKING_CANCEL: 'booking:cancel',
    BOOKING_CREATED: 'booking:created',
    BOOKING_UPDATED: 'booking:updated',
    BOOKING_ASSIGNED: 'booking:assigned',
    BOOKING_COMPLETED: 'booking:completed',
    BOOKING_CANCELLED: 'booking:cancelled',
    // Driver Events
    DRIVER_LOCATION: 'driver:location',
    DRIVER_STATUS: 'driver:status',
    DRIVER_LOCATION_UPDATED: 'driver:location_updated',
    DRIVER_STATUS_UPDATED: 'driver:status_updated',
    // Chat Events
    MESSAGE_SEND: 'message:send',
    MESSAGE_RECEIVED: 'message:received',
    TYPING_START: 'typing:start',
    TYPING_STOP: 'typing:stop',
    // Notification Events
    NOTIFICATION: 'notification',
    NOTIFICATION_READ: 'notification:read',
};
// App Configuration
exports.APP_CONFIG = {
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    // File Upload
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
    // Timeouts
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    AUTH_TOKEN_EXPIRY: '24h',
    REFRESH_TOKEN_EXPIRY: '7d',
    OTP_EXPIRY: 300, // 5 minutes
    // Rate Limiting
    DEFAULT_RATE_LIMIT: 100, // requests per window
    AUTH_RATE_LIMIT: 10, // requests per window for auth endpoints
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    // Pricing
    BASE_FARE: 50, // Base fare in ZAR
    INSURANCE_RATE: 0.05, // 5%
    TAX_RATE: 0.15, // 15% VAT
    SURGE_MULTIPLIER_MAX: 2.0,
    // Distance
    MAX_BOOKING_DISTANCE: 500, // km
    MIN_BOOKING_DISTANCE: 1, // km
    // Geolocation
    DEFAULT_LOCATION_ACCURACY: 100, // meters
    LOCATION_UPDATE_INTERVAL: 30000, // 30 seconds
};
// Vehicle Classes
exports.VEHICLE_CLASSES = {
    MINI_VAN: {
        id: 'mini-van',
        name: 'Mini Van',
        capacity: 'Up to 1 ton',
        basePrice: 150,
        pricePerKm: 12,
    },
    ONE_TON: {
        id: '1-ton',
        name: '1 Ton Truck',
        capacity: '1 ton',
        basePrice: 200,
        pricePerKm: 15,
    },
    TWO_TON: {
        id: '2-ton',
        name: '2 Ton Truck',
        capacity: '2 tons',
        basePrice: 300,
        pricePerKm: 20,
    },
    FOUR_TON: {
        id: '4-ton',
        name: '4 Ton Truck',
        capacity: '4 tons',
        basePrice: 500,
        pricePerKm: 30,
    },
    EIGHT_TON: {
        id: '8-ton',
        name: '8 Ton Truck',
        capacity: '8 tons',
        basePrice: 800,
        pricePerKm: 45,
    },
    FOURTEEN_TON: {
        id: '14-ton',
        name: '14 Ton Truck',
        capacity: '14 tons',
        basePrice: 1200,
        pricePerKm: 60,
    },
};
// Theme Colors
exports.COLORS = {
    PRIMARY: '#0057FF',
    PRIMARY_LIGHT: '#00B2FF',
    SECONDARY: '#FF6B00',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    GRAY: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
};
exports.default = {
    API_ENDPOINTS: exports.API_ENDPOINTS,
    HTTP_STATUS: exports.HTTP_STATUS,
    ERROR_CODES: exports.ERROR_CODES,
    SOCKET_EVENTS: exports.SOCKET_EVENTS,
    APP_CONFIG: exports.APP_CONFIG,
    VEHICLE_CLASSES: exports.VEHICLE_CLASSES,
    COLORS: exports.COLORS,
};
