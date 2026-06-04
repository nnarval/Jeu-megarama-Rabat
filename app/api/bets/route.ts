import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMatch } from '@/lib/matches';

// GET /api/bets?matchId=bresil-maroc - get all bets for a match (admin)
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

    const bets = await prisma.bet.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bets });
  } catch (error) {
    console.error('GET /api/bets error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/bets - submit a bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchId, instagram, team1Score, team2Score, scorers } = body;

    // Validate matchId
    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId invalide' }, { status: 400 });
    }

    if (!getMatch(matchId)) {
      return NextResponse.json({ error: 'Match inconnu' }, { status: 400 });
    }

    // Validate instagram
    if (!instagram || typeof instagram !== 'string') {
      return NextResponse.json({ error: 'Instagram invalide' }, { status: 400 });
    }

    const cleanInstagram = instagram.replace(/^@/, '').toLowerCase().trim();

    if (!cleanInstagram || cleanInstagram.length < 1) {
      return NextResponse.json({ error: 'Instagram invalide' }, { status: 400 });
    }

    // Validate scores
    if (
      typeof team1Score !== 'number' ||
      typeof team2Score !== 'number' ||
      team1Score < 0 ||
      team1Score > 20 ||
      team2Score < 0 ||
      team2Score > 20
    ) {
      return NextResponse.json({ error: 'Score invalide' }, { status: 400 });
    }

    if (!Array.isArray(scorers)) {
      return NextResponse.json({ error: 'Buteurs invalides' }, { status: 400 });
    }

    // Check if betting is open
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

    if (!config.bettingOpen) {
      return NextResponse.json({ error: 'Les paris sont fermés' }, { status: 403 });
    }

    // Check for duplicate instagram for this match
    const existing = await prisma.bet.findUnique({
      where: { matchId_instagram: { matchId, instagram: cleanInstagram } },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un pari existe déjà pour ce compte Instagram' },
        { status: 409 }
      );
    }

    // Create the bet
    const bet = await prisma.bet.create({
      data: {
        matchId,
        instagram: cleanInstagram,
        team1Score: Math.floor(team1Score),
        team2Score: Math.floor(team2Score),
        scorers: scorers.filter((s: unknown) => typeof s === 'string'),
      },
    });

    return NextResponse.json({ bet }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/bets error:', error);
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return NextResponse.json(
        { error: 'Un pari existe déjà pour ce compte Instagram' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
