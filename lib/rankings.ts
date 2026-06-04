export type MatchResult = 'brazil' | 'morocco' | 'draw';

export interface BetData {
  id: string;
  instagram: string;
  brazilScore: number;
  moroccoScore: number;
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

function getResult(brazil: number, morocco: number): MatchResult {
  if (brazil > morocco) return 'brazil';
  if (morocco > brazil) return 'morocco';
  return 'draw';
}

export function computeRankings(
  bets: BetData[],
  realBrazilScore: number,
  realMoroccoScore: number,
  realScorers: string[]
): RankedBet[] {
  const realResult = getResult(realBrazilScore, realMoroccoScore);
  const realScorersSet = new Set(realScorers.map((s) => s.toLowerCase().trim()));

  const scored: Array<BetData & {
    resultCorrect: boolean;
    scoreExact: boolean;
    scorersMatched: number;
    scorersTotal: number;
  }> = bets.map((bet) => {
    const betResult = getResult(bet.brazilScore, bet.moroccoScore);
    const resultCorrect = betResult === realResult;
    const scoreExact =
      bet.brazilScore === realBrazilScore && bet.moroccoScore === realMoroccoScore;

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
