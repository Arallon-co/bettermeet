// Error types for consistent error handling across the application

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, string>;
}

// Error codes for different types of errors
export enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_TIMEZONE = 'INVALID_TIMEZONE',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_TIME_FORMAT = 'INVALID_TIME_FORMAT',

  // Database errors
  POLL_NOT_FOUND = 'POLL_NOT_FOUND',
  PARTICIPANT_NOT_FOUND = 'PARTICIPANT_NOT_FOUND',
  TIME_SLOT_NOT_FOUND = 'TIME_SLOT_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',

  // Business logic errors
  POLL_EXPIRED = 'POLL_EXPIRED',
  DUPLICATE_PARTICIPANT = 'DUPLICATE_PARTICIPANT',
  INVALID_AVAILABILITY = 'INVALID_AVAILABILITY',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Generic errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_REQUEST = 'BAD_REQUEST',
}

// Error messages for user-friendly display
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.INVALID_TIMEZONE]: 'The selected timezone is not valid.',
  [ErrorCode.INVALID_DATE_FORMAT]: 'Please enter a valid date.',
  [ErrorCode.INVALID_TIME_FORMAT]: 'Please enter a valid time.',

  [ErrorCode.POLL_NOT_FOUND]: 'The requested poll could not be found.',
  [ErrorCode.PARTICIPANT_NOT_FOUND]: 'Participant not found.',
  [ErrorCode.TIME_SLOT_NOT_FOUND]: 'Time slot not found.',
  [ErrorCode.DATABASE_ERROR]: 'A database error occurred. Please try again.',

  [ErrorCode.POLL_EXPIRED]: 'This poll is no longer accepting responses.',
  [ErrorCode.DUPLICATE_PARTICIPANT]:
    'A participant with this email already exists.',
  [ErrorCode.INVALID_AVAILABILITY]: 'Invalid availability data provided.',

  [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',

  [ErrorCode.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred.',
  [ErrorCode.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCode.FORBIDDEN]: 'Access to this resource is forbidden.',
  [ErrorCode.BAD_REQUEST]: 'Invalid request. Please check your input.',
};

// Helper function to create API errors
export function createApiError(
  statusCode: number,
  code: ErrorCode,
  message?: string,
  details?: Record<string, string>
): ApiError {
  const error = new Error(message || ErrorMessages[code]) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

// Helper function to create error responses
export function createErrorResponse(
  code: ErrorCode,
  message?: string,
  details?: Record<string, string>
): ErrorResponse {
  return {
    error: {
      code,
      message: message || ErrorMessages[code],
      details,
    },
  };
}
