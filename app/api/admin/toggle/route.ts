import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMatch } from '@/lib/matches';

// POST /api/admin/toggle - toggle betting open/closed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, matchId } = body;

    if (password !== 'megarama2026') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!matchId || typeof matchId !== 'string') {
      return NextResponse.json({ error: 'matchId invalide' }, { status: 400 });
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

    const updated = await prisma.matchConfig.update({
      where: { id: matchId },
      data: { bettingOpen: !config.bettingOpen },
    });

    return NextResponse.json({ bettingOpen: updated.bettingOpen });
  } catch (error) {
    console.error('POST /api/admin/toggle error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
