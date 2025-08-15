import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import authService from '../../../../services/authService';
import { logger } from '../../../../utils/logger';
import { ValidationError } from '../../../../utils/errors';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.request('POST', '/api/auth/login');

    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
      throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
    }

    const { email, password } = validationResult.data;

    // Authenticate user
    const result = await authService.login({
      email,
      password,
    });

    const duration = Date.now() - startTime;
    logger.request('POST', '/api/auth/login', duration, 200);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: result,
      },
      { status: 200 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof ValidationError) {
      logger.request('POST', '/api/auth/login', duration, 400);
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
    logger.error('Unexpected error in login route:', error);
    logger.request('POST', '/api/auth/login', duration, 500);

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
