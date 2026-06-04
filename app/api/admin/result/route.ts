import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMatch } from '@/lib/matches';

// POST /api/admin/result - set match result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, matchId, team1Score, team2Score, scorers } = body;

    if (password !== 'megarama2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId invalide' }, { status: 400 });
    }

    if (!getMatch(matchId)) {
      return NextResponse.json({ error: 'Match inconnu' }, { status: 400 });
    }

    if (
      typeof team1Score !== 'number' ||
      typeof team2Score !== 'number' ||
      team1Score < 0 ||
      team2Score < 0
    ) {
      return NextResponse.json({ error: 'Score invalide' }, { status: 400 });
    }

    if (!Array.isArray(scorers)) {
      return NextResponse.json({ error: 'Buteurs invalides' }, { status: 400 });
    }

    let config = await prisma.matchConfig.findUnique({
      where: { id: matchId },
    });

    if (!config) {
      config = await prisma.matchConfig.create({
        data: {
          id: matchId,
          bettingOpen: false,
          realScorers: [],
        },
      });
    }

    const updated = await prisma.matchConfig.update({
      where: { id: matchId },
      data: {
        realTeam1Score: Math.floor(team1Score),
        realTeam2Score: Math.floor(team2Score),
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
