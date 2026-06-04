import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/result - set match result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, brazilScore, moroccoScore, scorers } = body;

    if (password !== 'megarama2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (
      typeof brazilScore !== 'number' ||
      typeof moroccoScore !== 'number' ||
      brazilScore < 0 ||
      moroccoScore < 0
    ) {
      return NextResponse.json({ error: 'Score invalide' }, { status: 400 });
    }

    if (!Array.isArray(scorers)) {
      return NextResponse.json({ error: 'Buteurs invalides' }, { status: 400 });
    }

    let config = await prisma.matchConfig.findUnique({
      where: { id: 'brazil-morocco' },
    });

    if (!config) {
      config = await prisma.matchConfig.create({
        data: {
          id: 'brazil-morocco',
          bettingOpen: false,
          realScorers: [],
        },
      });
    }

    const updated = await prisma.matchConfig.update({
      where: { id: 'brazil-morocco' },
      data: {
        realBrazilScore: Math.floor(brazilScore),
        realMoroccoScore: Math.floor(moroccoScore),
        realScorers: scorers.filter((s: unknown) => typeof s === 'string'),
        bettingOpen: false,
      },
    });

    return NextResponse.json({ config: updated });
  } catch (error) {
    console.error('POST /api/admin/result error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
