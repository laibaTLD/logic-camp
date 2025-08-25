import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";

// ----------------------
// GET all users
// ----------------------
export async function GET() {
  try {
    const { User } = await getModels();

    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"], // only safe fields
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// ----------------------
// PUT to approve a user
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { User } = await getModels();

    const [updatedRows] = await User.update(
      { isApproved: true },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return NextResponse.json(
        { error: "User not found or already approved" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "User approved" }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    );
  }
}
