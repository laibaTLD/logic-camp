// This file contains additional route handlers for admin user management
// The main routes are in route.ts, but you can add more specific endpoints here

import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

// Helper: Verify Admin
async function checkAdmin(req: NextRequest) {
  const payload = await verifyToken(req);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (payload.role !== "admin") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null; // ✅ means authorized
}

// GET user by ID with detailed information
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 });
    }

    const models = await getModels();
    const user = await models.User.findByPk(userId, {
      attributes: ["id", "name", "email", "role", "isActive", "isApproved", "createdAt", "updatedAt"]
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error("GET /admin/users/[id] error:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}

// PUT update user by ID
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 });
    }

    const body = await req.json();
    const { name, email, role, isActive, isApproved } = body;

    const models = await getModels();
    const user = await models.User.findByPk(userId);
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    // Update user with provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isApproved !== undefined) updateData.isApproved = isApproved;

    await user.update(updateData);

    return NextResponse.json({ 
      success: true, 
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isApproved: user.isApproved
      }
    });
  } catch (err: any) {
    console.error("PUT /admin/users/[id] error:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = checkAdmin(req);
  if (authError) return authError;

  try {
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid user ID" 
      }, { status: 400 });
    }

    const models = await getModels();
    const deletedRows = await models.User.destroy({ where: { id: userId } });

    if (deletedRows === 0) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (err: any) {
    console.error("DELETE /admin/users/[id] error:", err.message);
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
