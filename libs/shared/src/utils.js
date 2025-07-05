"use strict";
/**
 * Utility functions for RELOConnect
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToColor = exports.isValidCoordinate = exports.formatPhoneNumber = exports.getInitials = exports.slugify = exports.capitalize = exports.retry = exports.sleep = exports.deepClone = exports.throttle = exports.debounce = exports.generateId = exports.isValidPhone = exports.isValidEmail = exports.calculateDistance = exports.formatDuration = exports.formatDistance = exports.formatCurrency = void 0;
// Format currency
const formatCurrency = (amount, currency = 'ZAR') => {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
// Format distance
const formatDistance = (distanceInKm) => {
    if (distanceInKm < 1) {
        return `${Math.round(distanceInKm * 1000)}m`;
    }
    return `${distanceInKm.toFixed(1)}km`;
};
exports.formatDistance = formatDistance;
// Format duration
const formatDuration = (durationInMinutes) => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    if (hours === 0) {
        return `${minutes}min`;
    }
    if (minutes === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${minutes}min`;
};
exports.formatDuration = formatDuration;
// Calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};
exports.calculateDistance = calculateDistance;
const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};
// Validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
// Validate phone number (South African format)
const isValidPhone = (phone) => {
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.isValidPhone = isValidPhone;
// Generate random ID
const generateId = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateId = generateId;
// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};
exports.debounce = debounce;
// Throttle function
const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
exports.throttle = throttle;
// Deep clone object
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => (0, exports.deepClone)(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = (0, exports.deepClone)(obj[key]);
            }
        }
        return clonedObj;
    }
    return obj;
};
exports.deepClone = deepClone;
// Sleep utility
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
// Retry function with exponential backoff
const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    }
    catch (error) {
        if (retries <= 0)
            throw error;
        await (0, exports.sleep)(delay);
        return (0, exports.retry)(fn, retries - 1, delay * 2);
    }
};
exports.retry = retry;
// Capitalize first letter
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
exports.capitalize = capitalize;
// Convert string to slug
const slugify = (str) => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};
exports.slugify = slugify;
// Get initials from name
const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
exports.getInitials = getInitials;
// Format phone number for display
const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('27')) {
        return `+27 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.startsWith('0')) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
};
exports.formatPhoneNumber = formatPhoneNumber;
// Validate and format location
const isValidCoordinate = (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};
exports.isValidCoordinate = isValidCoordinate;
// Generate color from string (for avatars)
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 50%)`;
};
exports.stringToColor = stringToColor;
exports.default = {
    formatCurrency: exports.formatCurrency,
    formatDistance: exports.formatDistance,
    formatDuration: exports.formatDuration,
    calculateDistance: exports.calculateDistance,
    isValidEmail: exports.isValidEmail,
    isValidPhone: exports.isValidPhone,
    generateId: exports.generateId,
    debounce: exports.debounce,
    throttle: exports.throttle,
    deepClone: exports.deepClone,
    sleep: exports.sleep,
    retry: exports.retry,
    capitalize: exports.capitalize,
    slugify: exports.slugify,
    getInitials: exports.getInitials,
    formatPhoneNumber: exports.formatPhoneNumber,
    isValidCoordinate: exports.isValidCoordinate,
    stringToColor: exports.stringToColor,
};
