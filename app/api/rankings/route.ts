import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeRankings } from '@/lib/rankings';
import { getMatch } from '@/lib/matches';

// GET /api/rankings?matchId=bresil-maroc - get computed rankings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    if (!matchId) {
      return NextResponse.json({ error: 'matchId requis' }, { status: 400 });
    }

    if (!getMatch(matchId)) {
      return NextResponse.json({ error: 'Match inconnu' }, { status: 400 });
    }

    const config = await prisma.matchConfig.findUnique({
      where: { id: matchId },
    });

    if (
      !config ||
      config.realTeam1Score === null ||
      config.realTeam2Score === null
    ) {
      return NextResponse.json({ error: 'Résultat non encore saisi' }, { status: 404 });
    }

    const bets = await prisma.bet.findMany({
      where: { matchId },
      orderBy: { createdAt: 'asc' },
    });

    const rankings = computeRankings(
      bets,
      config.realTeam1Score,
      config.realTeam2Score,
      config.realScorers
    );

    return NextResponse.json({
      rankings,
      realTeam1Score: config.realTeam1Score,
      realTeam2Score: config.realTeam2Score,
      realScorers: config.realScorers,
    });
  } catch (error) {
    console.error('GET /api/rankings error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
