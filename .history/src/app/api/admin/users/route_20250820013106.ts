import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";
import "dotenv/config"; // load .env

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env file");
}

// Helper: verify JWT token from Authorization header
const verifyToken = (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }
  const token = authHeader.split(" ")[1];
  try {
    const res = jwt.decode(token)
    console.log(token)
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") throw new Error("Not authorized");
    return decoded; // contains {id, email, role}
  } catch (err) {
    throw new Error("Invalid token");
  }
};

// ----------------------
// GET all users
// ----------------------
export async function GET(req: NextRequest) {
  try {
    verifyToken(req); // check JWT

    const { User } = await getModels();

    const users = await User.findAll({
      order: [["id", "ASC"]],
      attributes: ["id", "name", "email", "role", "isActive", "isApproved"], // only safe fields
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 401 } // unauthorized if JWT fails
    );
  }
}

// ----------------------
// PUT to approve a user
// ----------------------
export async function PUT(req: NextRequest) {
  try {
    verifyToken(req); // check JWT

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

    const { User } = await getModels();

    const [updatedRows] = await User.update(
      { isApproved: true },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return NextResponse.json({ error: "User not found or already approved" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User approved" }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/admin/users error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Failed to approve user" },
      { status: 401 }
    );
  }
}
