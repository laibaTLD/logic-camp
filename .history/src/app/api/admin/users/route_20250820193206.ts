// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";
import "dotenv/config";

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET must be set in .env file");

// ----------------------
// Helper: verify admin
// ----------------------
const verifyAdminToken = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("No token provided");

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  if (decoded.role !== "admin") throw new Error("Not authorized");
  return decoded; // {id, email, role}
};

// ----------------------
// GET all users
// ----------------------
export async function GET(req: NextRequest) {
  try {
    verifyAdminToken(req);

    const { User } = await getModels();
    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"],
    });

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 401 }
    );
  }
}

// ----------------------
// PUT (Approve OR Edit)
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    verifyAdminToken(req);
    const { id, approve, name, email, role, isActive } = await req.json();

    if (!id)
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );

    const { User } = await getModels();
    const user = await User.findByPk(id);
    if (!user)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    if (approve === true) {
      await user.update({ isApproved: true });
      return NextResponse.json({
        success: true,
        message: "User approved successfully",
      });
    } else if (approve === false) {
      await user.update({ isApproved: false });
      return NextResponse.json({
        success: true,
        message: "User rejected successfully",
      });
    } else {
      // Editing user
      await user.update({ name, email, role, isActive });
      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

// ----------------------
// DELETE user
// ----------------------
export async function DELETE(req: NextRequest) {
  try {
    verifyAdminToken(req);
    const { id } = await req.json();

    if (!id)
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );

    const { User } = await getModels();
    const deletedRows = await User.destroy({ where: { id } });

    if (deletedRows === 0)
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
