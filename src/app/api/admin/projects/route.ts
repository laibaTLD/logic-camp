// src/app/api/admin/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { Op } from "sequelize";

// ----------------------
// Helper: Verify Admin
// ----------------------
async function checkAdmin(req: NextRequest) {
  const authResult = await verifyToken(req);
  if (!authResult.success || !authResult.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!authResult.user.role || authResult.user.role !== 'admin') {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// ----------------------
// GET all projects (admin only) with pagination and search
// ----------------------
export async function GET(req: NextRequest) {
  const authError = await checkAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const all = (searchParams.get('all') || '').toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const search = (searchParams.get('search') || '').trim();
    const offset = (page - 1) * limit;

    const { Project, User, Team } = await getModels();

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Count distinct projects separately to avoid overcounting due to nested includes (Sequelize limitation)
    const total = await Project.count({ where });

    // If client requests all, bypass pagination
    const fetchOptions: any = {
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
          required: false,
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id', 'name', 'email'],
              through: { attributes: [] },
              required: false,
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
    };

    if (!(all === '1' || all === 'true')) {
      fetchOptions.limit = limit;
      fetchOptions.offset = offset;
    }

    // Ensure deterministic ordering by primary key when paginating
    fetchOptions.order = [['id', 'ASC']];
    const rows = await Project.findAll(fetchOptions);

    const effectiveTotal = all === '1' || all === 'true' ? rows.length : total;
    const effectiveLimit = all === '1' || all === 'true' ? rows.length || 1 : limit;
    const effectivePage = all === '1' || all === 'true' ? 1 : page;
    const totalPages = Math.ceil(effectiveTotal / effectiveLimit) || 1;

    return NextResponse.json({ 
      success: true, 
      projects: rows, 
      total: effectiveTotal, 
      page: effectivePage, 
      limit: effectiveLimit, 
      totalPages 
    }, { status: 200 });
  } catch (err: any) {
    console.error("GET /admin/projects error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}