import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { authenticateUser } from "@/lib/auth";
import { z } from "zod";

const assignMembersSchema = z.object({
  userIds: z.array(z.number()).min(1, "At least one userId is required"),
});


export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const { Team, TeamMember } = await getModels();
    const authResult = await authenticateUser(req);
    if (authResult instanceof NextResponse) return authResult;
    const payload = authResult;

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "Only admins can assign members" }, { status: 403 });
    }

    const teamId = parseInt(resolvedParams.id);
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
        where: { team_id: teamId, user_id: userId },
        defaults: {
          team_id: teamId,
          user_id: userId,
          role: "member",
          is_active: true,
          joined_at: new Date(),
        },
      });
    }

    return NextResponse.json({ message: "Members assigned successfully" });
  } catch (err: any) {
    console.error("Assign members error:", err);
    return NextResponse.json({ error: "Internal server error", details: err.message }, { status: 500 });
  }
}
