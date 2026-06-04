import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/status - get betting open/closed status
export async function GET() {
  try {
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

    return NextResponse.json({
      bettingOpen: config.bettingOpen,
      hasResult: config.realBrazilScore !== null && config.realMoroccoScore !== null,
    });
  } catch (error) {
    console.error('GET /api/status error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
