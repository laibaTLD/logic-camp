// src/lib/db-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseConnection } from './db-connection';

/**
 * Higher-order function that ensures database is initialized before running API handler
 */
export function withDatabase<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Ensure database is initialized
      await ensureDatabaseConnection();
      
      // Call the original handler
      return await handler(req, ...args);
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }
  };
}

// Usage example for your register route:
/*
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { withDatabase } from "@/lib/db-middleware";
import User from "@/models/User";

async function registerHandler(req: NextRequest) {
  // Your existing logic here...
  const existingUser = await User.findOne({ where: { email } });
  // ... rest of your code
}

export const POST = withDatabase(registerHandler);
*/