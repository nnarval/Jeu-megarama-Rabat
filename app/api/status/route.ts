import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMatch } from '@/lib/matches';

// GET /api/status?matchId=bresil-maroc - get betting open/closed status
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

    let config = await prisma.matchConfig.findUnique({
      where: { id: matchId },
    });

    if (!config) {
      config = await prisma.matchConfig.create({
        data: {
          id: matchId,
          bettingOpen: true,
          realScorers: [],
        },
      });
    }

    return NextResponse.json({
      bettingOpen: config.bettingOpen,
      hasResult: config.realTeam1Score !== null && config.realTeam2Score !== null,
    });
  } catch (error) {
    console.error('GET /api/status error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
