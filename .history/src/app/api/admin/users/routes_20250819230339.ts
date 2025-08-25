// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { getModels } from "@/lib/db";

export async function GET() {
  try {
    console.log('🔍 GET /api/admin/users - Starting request');
    
    // Get models after ensuring database is initialized
    console.log('🔄 Getting models...');
    const { User } = await getModels();
    console.log('✅ Models retrieved successfully');

    console.log('📊 Fetching users from database...');
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "isActive", "isApproved", "createdAt", "updatedAt"], // exclude password
    });
    console.log(`✅ Found ${users.length} users`);

    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    console.error("❌ Error stack:", err instanceof Error ? err.stack : 'No stack trace');
    
    // Return more detailed error information in development
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json({ 
      error: "Failed to fetch users",
      ...(isDev && { 
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      })
    }, { status: 500 });
  }
}