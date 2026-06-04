import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/reset - delete all bets for a match and reset its config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, matchId } = body;

    if (password !== 'megarama2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId requis' }, { status: 400 });
    }

    // Delete all bets for this match
    const deleted = await prisma.bet.deleteMany({
      where: { matchId },
    });

    // Reset match config
    await prisma.matchConfig.upsert({
      where: { id: matchId },
      update: {
        bettingOpen: true,
        realTeam1Score: null,
        realTeam2Score: null,
        realScorers: [],
      },
      create: {
        id: matchId,
        bettingOpen: true,
        realScorers: [],
      },
    });

    return NextResponse.json({ deleted: deleted.count });
  } catch (error) {
    console.error('POST /api/admin/reset error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
