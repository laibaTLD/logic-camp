import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
import { assignMembersSchema } from "@/lib/validators";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { Team, TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign members" }, { status: 403 });
    }

    const teamId = parseInt(params.id);
    const team = await Team.findByPk(teamId);
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    const body = await req.json();
    const parsed = assignMembersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
    }

    const userIds = parsed.data.userIds;

    for (const userId of userIds) {
      await TeamMember.findOrCreate({
        where: { teamId, userId },
        defaults: {
          teamId,
          userId,
          role: "member",       // 👈 required
          isActive: true,       // 👈 required
          joinedAt: new Date(), // 👈 required
        },
      });
    }

    return NextResponse.json({ message: "Members assigned successfully" });
  } catch (err: any) {
    console.error("Assign members error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
