// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// ----------------------
// Helper: Verify Admin
// ----------------------
function checkAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return null; // ✅ means authorized
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
  }
}

// ----------------------
// GET all users (admin only)
// ----------------------
export async function GET(req: NextRequest) {
  const authError = checkAdmin(req);
  if (authError) return authError; // ❌ unauthorized/forbidden

  try {
    const models = await getModels();
    const users = await models.User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"],
    });

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/users error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ----------------------
// PUT (approve OR edit)
// ----------------------
export async function PUT(req: NextRequest) {
  const authError = checkAdmin(req);
  if (authError) return authError;

  try {
    const { id, approve, name, email, role, isActive } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const models = await getModels();
    const user = await models.User.findByPk(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (approve === true) {
      await user.update({ isApproved: true });
      return NextResponse.json({ success: true, message: "User approved successfully" });
    } else if (approve === false) {
      await user.update({ isApproved: false });
      return NextResponse.json({ success: true, message: "User rejected successfully" });
    } else {
      await user.update({ name, email, role, isActive });
      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user,
      });
    }
  } catch (err: any) {
    console.error("PUT /admin/users error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// ----------------------
// DELETE user
// ----------------------
export async function DELETE(req: NextRequest) {
  const authError = checkAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    const models = await getModels();
    const deletedRows = await models.User.destroy({ where: { id } });

    if (deletedRows === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    console.error("DELETE /admin/users error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
