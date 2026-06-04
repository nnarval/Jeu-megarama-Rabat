import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/toggle - toggle betting open/closed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password !== 'megarama2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    let config = await prisma.matchConfig.findUnique({
      where: { id: 'brazil-morocco' },
    });

    if (!config) {
      config = await prisma.matchConfig.create({
        data: {
          id: 'brazil-morocco',
          bettingOpen: true,
          realScorers: [],
        },
      });
    }

    const updated = await prisma.matchConfig.update({
      where: { id: 'brazil-morocco' },
      data: { bettingOpen: !config.bettingOpen },
    });

    return NextResponse.json({ bettingOpen: updated.bettingOpen });
  } catch (error) {
    console.error('POST /api/admin/toggle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
