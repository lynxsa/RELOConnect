import { Alert } from 'react-native';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    const timestamp = new Date();
    let appError: AppError;

    if (error instanceof Error) {
      appError = {
        code: error.name || 'UnknownError',
        message: error.message,
        details: error.stack,
        timestamp,
      };
    } else if (typeof error === 'string') {
      appError = {
        code: 'StringError',
        message: error,
        timestamp,
      };
    } else {
      appError = {
        code: 'UnknownError',
        message: 'An unknown error occurred',
        details: error,
        timestamp,
      };
    }

    // Log error for debugging
    console.error('[ErrorHandler]', context ? `[${context}]` : '', appError);

    return appError;
  }

  static handleApiError(error: unknown, context?: string): AppError {
    const appError = this.handle(error, context);
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      appError.code = 'NetworkError';
      appError.message = 'Network connection failed. Please check your internet connection and try again.';
    }
    
    // Check if it's a timeout error
    if (error instanceof Error && error.message.includes('timeout')) {
      appError.code = 'TimeoutError';
      appError.message = 'Request timed out. Please try again.';
    }

    return appError;
  }

  static showUserFriendlyError(error: AppError, fallbackMessage?: string): void {
    const userMessage = this.getUserFriendlyMessage(error) || fallbackMessage || 'Something went wrong. Please try again.';
    
    Alert.alert(
      'Error',
      userMessage,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.code) {
      case 'NetworkError':
        return 'Please check your internet connection and try again.';
      case 'TimeoutError':
        return 'The request took too long. Please try again.';
      case 'ValidationError':
        return 'Please check your input and try again.';
      case 'AuthenticationError':
        return 'Please log in again to continue.';
      case 'AuthorizationError':
        return 'You don\'t have permission to perform this action.';
      case 'NotFoundError':
        return 'The requested resource was not found.';
      case 'ServerError':
        return 'Our servers are experiencing issues. Please try again later.';
      default:
        return error.message;
    }
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError;
  }
}

// Common error types
export const ErrorCodes = {
  NETWORK_ERROR: 'NetworkError',
  TIMEOUT_ERROR: 'TimeoutError',
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  SERVER_ERROR: 'ServerError',
  UNKNOWN_ERROR: 'UnknownError',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
