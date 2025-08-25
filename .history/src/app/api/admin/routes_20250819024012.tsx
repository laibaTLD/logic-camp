// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sequelize } from "@/lib/database";
import User from "@/models/User";

// GET all users
export async function GET() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"], // select only necessary fields
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT to approve a user
export async function PUT(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await sequelize.authenticate();
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
  } catch (error) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to approve user" },
      { status: 500 }
    );
  }
}
