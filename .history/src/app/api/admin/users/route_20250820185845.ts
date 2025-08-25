import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";
import "dotenv/config"; // load .env

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET must be set in .env file");

// Helper: verify JWT token from Authorization header
const verifyAdminToken = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") throw new Error("Not authorized");
    return decoded; // contains {id, email, role}
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};

// ----------------------
// GET all users
// ----------------------
export async function GET(req: NextRequest) {
  try {
    verifyAdminToken(req); // check JWT & role

    const { User } = await getModels();

    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"], // only safe fields
    });

    return NextResponse.json({ success: true, users }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: error.message.includes("token") || error.message.includes("Not authorized") ? 401 : 500 }
    );
  }
}

// ----------------------
// PUT to approve a user
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    verifyAdminToken(req); // check JWT

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });

    const { User } = await getModels();

    const [updatedRows] = await User.update(
      { isApproved: true },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return NextResponse.json({ success: false, error: "User not found or already approved" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User approved successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to approve user" },
      { status: error.message.includes("token") || error.message.includes("Not authorized") ? 401 : 500 }
    );
  }
}

// ----------------------
// PATCH to reject a user (optional)
// ----------------------
export async function PATCH(req: NextRequest) {
  try {
    verifyAdminToken(req); // check JWT

    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });

    const { User } = await getModels();

    const [updatedRows] = await User.update(
      { isApproved: false },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return NextResponse.json({ success: false, error: "User not found or already rejected" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User rejected successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject user" },
      { status: error.message.includes("token") || error.message.includes("Not authorized") ? 401 : 500 }
    );
  }
}
// DELETE user
export async function DELETE(req: NextRequest) {
  try {
    verifyAdminToken(req);
    const { id } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });

    const { User } = await getModels();
    const deletedRows = await User.destroy({ where: { id } });

    if (deletedRows === 0)
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}

// PUT edit user
export async function PUT_edit(req: NextRequest) {
  try {
    verifyAdminToken(req);
    const { id, name, email, role, isActive } = await req.json();
    if (!id) return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });

    const { User } = await getModels();
    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    await user.update({ name, email, role, isActive });
    return NextResponse.json({ success: true, message: "User updated successfully", user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
