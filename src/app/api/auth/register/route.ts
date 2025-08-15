import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import authService from '../../../../services/authService';
import { logger } from '../../../../utils/logger';
import { ValidationError } from '../../../../utils/errors';

// Validation schema for registration
const registrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'member']).optional().default('member'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.request('POST', '/api/auth/register');

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }

    const { name, email, password, role } = validationResult.data;

    // Register user
    const result = await authService.register({
      name,
      email,
      password,
      role,
    });

    const duration = Date.now() - startTime;
    logger.request('POST', '/api/auth/register', duration, 201);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        data: result,
      },
      { status: 201 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      logger.request('POST', '/api/auth/register', duration, 400);
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
        },
        { status: 400 }
      );
    }

    // Log unexpected errors
    logger.error('Unexpected error in registration route:', error);
    logger.request('POST', '/api/auth/register', duration, 500);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
