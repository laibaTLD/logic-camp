import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/statuses/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    // In a real implementation, delete from DB.
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete status' }, { status: 500 });
  }
}


