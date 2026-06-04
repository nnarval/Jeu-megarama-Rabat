export type MatchResult = 'team1' | 'team2' | 'draw';

export interface BetData {
  id: string;
  matchId: string;
  instagram: string;
  team1Score: number;
  team2Score: number;
  scorers: string[];
  createdAt: Date;
}

export interface RankedBet extends BetData {
  rank: number;
  resultCorrect: boolean;
  scoreExact: boolean;
  scorersMatched: number;
  scorersTotal: number;
}

function getResult(team1: number, team2: number): MatchResult {
  if (team1 > team2) return 'team1';
  if (team2 > team1) return 'team2';
  return 'draw';
}

export function computeRankings(
  bets: BetData[],
  realTeam1Score: number,
  realTeam2Score: number,
  realScorers: string[]
): RankedBet[] {
  const realResult = getResult(realTeam1Score, realTeam2Score);
  const realScorersSet = new Set(realScorers.map((s) => s.toLowerCase().trim()));

  const scored: Array<BetData & {
    resultCorrect: boolean;
    scoreExact: boolean;
    scorersMatched: number;
    scorersTotal: number;
  }> = bets.map((bet) => {
    const betResult = getResult(bet.team1Score, bet.team2Score);
    const resultCorrect = betResult === realResult;
    const scoreExact =
      bet.team1Score === realTeam1Score && bet.team2Score === realTeam2Score;

    const scorersMatched = bet.scorers.filter((s) =>
      realScorersSet.has(s.toLowerCase().trim())
    ).length;

    return {
      ...bet,
      resultCorrect,
      scoreExact,
      scorersMatched,
      scorersTotal: realScorers.length,
    };
  });

  // Sort: 1) resultCorrect desc, 2) scoreExact desc, 3) scorersMatched desc, 4) createdAt asc (earlier = better)
  scored.sort((a, b) => {
    if (b.resultCorrect !== a.resultCorrect) return (b.resultCorrect ? 1 : 0) - (a.resultCorrect ? 1 : 0);
    if (b.scoreExact !== a.scoreExact) return (b.scoreExact ? 1 : 0) - (a.scoreExact ? 1 : 0);
    if (b.scorersMatched !== a.scorersMatched) return b.scorersMatched - a.scorersMatched;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Assign ranks (ties get same rank)
  const ranked: RankedBet[] = [];
  let currentRank = 1;

  for (let i = 0; i < scored.length; i++) {
    const current = scored[i];
    if (i > 0) {
      const prev = scored[i - 1];
      const isTie =
        current.resultCorrect === prev.resultCorrect &&
        current.scoreExact === prev.scoreExact &&
        current.scorersMatched === prev.scorersMatched;
      if (!isTie) {
        currentRank = i + 1;
      }
    }
    ranked.push({ ...current, rank: currentRank });
  }

  return ranked;
}
