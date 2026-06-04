import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bets - get all bets (admin)
export async function GET() {
  try {
    const bets = await prisma.bet.findMany({
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
    const { instagram, brazilScore, moroccoScore, scorers } = body;

    // Validation
    if (!instagram || typeof instagram !== 'string') {
      return NextResponse.json({ error: 'Instagram invalide' }, { status: 400 });
    }

    const cleanInstagram = instagram.replace(/^@/, '').toLowerCase().trim();

    if (!cleanInstagram || cleanInstagram.length < 1) {
      return NextResponse.json({ error: 'Instagram invalide' }, { status: 400 });
    }

    if (
      typeof brazilScore !== 'number' ||
      typeof moroccoScore !== 'number' ||
      brazilScore < 0 ||
      brazilScore > 20 ||
      moroccoScore < 0 ||
      moroccoScore > 20
    ) {
      return NextResponse.json({ error: 'Score invalide' }, { status: 400 });
    }

    if (!Array.isArray(scorers)) {
      return NextResponse.json({ error: 'Buteurs invalides' }, { status: 400 });
    }

    // Check if betting is open
    let config = await prisma.matchConfig.findUnique({
      where: { id: 'brazil-morocco' },
    });

    if (!config) {
      // Create default config
      config = await prisma.matchConfig.create({
        data: {
          id: 'brazil-morocco',
          bettingOpen: true,
          realScorers: [],
        },
      });
    }

    if (!config.bettingOpen) {
      return NextResponse.json({ error: 'Les paris sont fermés' }, { status: 403 });
    }

    // Check for duplicate instagram
    const existing = await prisma.bet.findUnique({
      where: { instagram: cleanInstagram },
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
        instagram: cleanInstagram,
        brazilScore: Math.floor(brazilScore),
        moroccoScore: Math.floor(moroccoScore),
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
