import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Helper: Verify Admin
function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

// ----------------------
// PUT (Update User)
// ----------------------
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { params } = context;

  if (!verifyAdmin(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { User } = await getModels();

  // ✅ Validate params.id
  if (!params?.id)
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

  const id = Number(params.id);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });

  try {
    const data = await req.json();

    const user = await User.findByPk(id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validate role
    if (data.role && !["employee", "teamLead", "admin"].includes(data.role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Only update allowed fields
    const allowedUpdates: any = {};
    if (data.name !== undefined) allowedUpdates.name = data.name;
    if (data.email !== undefined) allowedUpdates.email = data.email;
    if (data.role !== undefined) allowedUpdates.role = data.role;
    if (data.isApproved !== undefined) allowedUpdates.isApproved = data.isApproved;

    const updatedUser = await user.update(allowedUpdates);

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}
