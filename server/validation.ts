import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
}

// Validation middleware factory - validates request body against Zod schema
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors: ValidationError[] = result.error.errors.map(err => ({
        field: err.path.join('.') || 'root',
        message: err.message
      }));

      return res.status(400).json({
        error: 'Request validation failed',
        details: errors
      });
    }

    req.body = result.data;
    next();
  };
}

// Direct validation function for manual validation
export function validateData<T>(data: unknown, schema: ZodSchema): { success: boolean; data?: T; errors?: ValidationError[] } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: ValidationError[] = result.error.errors.map(err => ({
      field: err.path.join('.') || 'root',
      message: err.message
    }));

    return { success: false, errors };
  }

  return { success: true, data: result.data as T };
}
