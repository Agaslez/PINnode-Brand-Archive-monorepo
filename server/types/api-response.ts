/**
 * Standard API Response Format
 * All endpoints must return this format (or error handler wraps them)
 */

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  timestamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiResponseBuilder {
  static success<T>(data: T): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    code: string,
    message: string,
    statusCode: number = 500
  ): ApiErrorResponse {
    return {
      success: false,
      error: {
        code,
        message,
        statusCode,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
