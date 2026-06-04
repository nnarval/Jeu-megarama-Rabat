import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeRankings } from '@/lib/rankings';

// GET /api/rankings - get computed rankings
export async function GET() {
  try {
    const config = await prisma.matchConfig.findUnique({
      where: { id: 'brazil-morocco' },
    });

    if (
      !config ||
      config.realBrazilScore === null ||
      config.realMoroccoScore === null
    ) {
      return NextResponse.json({ error: 'Résultat non encore saisi' }, { status: 404 });
    }

    const bets = await prisma.bet.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const rankings = computeRankings(
      bets,
      config.realBrazilScore,
      config.realMoroccoScore,
      config.realScorers
    );

    return NextResponse.json({
      rankings,
      realBrazilScore: config.realBrazilScore,
      realMoroccoScore: config.realMoroccoScore,
      realScorers: config.realScorers,
    });
  } catch (error) {
    console.error('GET /api/rankings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
