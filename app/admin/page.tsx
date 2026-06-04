'use client';

import { useState, useEffect, useCallback } from 'react';
import { BRAZIL_PLAYERS, MOROCCO_PLAYERS } from '@/lib/players';

const ADMIN_PASSWORD = 'megarama2026';

interface Bet {
  id: string;
  instagram: string;
  brazilScore: number;
  moroccoScore: number;
  scorers: string[];
  createdAt: string;
}

interface RankedBet extends Bet {
  rank: number;
  resultCorrect: boolean;
  scoreExact: boolean;
  scorersMatched: number;
  scorersTotal: number;
}

interface MatchConfig {
  bettingOpen: boolean;
  realBrazilScore?: number;
  realMoroccoScore?: number;
  realScorers?: string[];
}

function getResultLabel(brazil: number, morocco: number) {
  if (brazil > morocco) return { label: 'Brésil 🇧🇷', color: 'text-yellow-400' };
  if (morocco > brazil) return { label: 'Maroc 🇲🇦', color: 'text-green-400' };
  return { label: 'Nul', color: 'text-gray-400' };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function exportToCSV(bets: Bet[], rankings?: RankedBet[]) {
  const rows: string[][] = [];

  if (rankings && rankings.length > 0) {
    rows.push(['Rang', 'Instagram', 'Score Brésil', 'Score Maroc', 'Résultat correct', 'Score exact', 'Buteurs corrects', 'Buteurs pariés', 'Date']);
    for (const r of rankings) {
      rows.push([
        String(r.rank),
        `@${r.instagram}`,
        String(r.brazilScore),
        String(r.moroccoScore),
        r.resultCorrect ? 'Oui' : 'Non',
        r.scoreExact ? 'Oui' : 'Non',
        `${r.scorersMatched}/${r.scorersTotal}`,
        r.scorers.join('; '),
        formatDate(r.createdAt),
      ]);
    }
  } else {
    rows.push(['Instagram', 'Score Brésil', 'Score Maroc', 'Buteurs', 'Date']);
    for (const b of bets) {
      rows.push([
        `@${b.instagram}`,
        String(b.brazilScore),
        String(b.moroccoScore),
        b.scorers.join('; '),
        formatDate(b.createdAt),
      ]);
    }
  }

  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pari-megarama-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Login screen
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-black text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Pari Megarama — Coupe du Monde 2026</p>
        </div>
        <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Mot de passe"
            className="w-full bg-[#0a0a0a] border-2 border-[#2a2a2a] focus:border-green-500/60 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={!password}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-[#1f1f1f] disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition-all"
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [bets, setBets] = useState<Bet[]>([]);
  const [bettingOpen, setBettingOpen] = useState(true);
  const [rankings, setRankings] = useState<RankedBet[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Result form state
  const [realBrazilScore, setRealBrazilScore] = useState(0);
  const [realMoroccoScore, setRealMoroccoScore] = useState(0);
  const [realScorers, setRealScorers] = useState<string[]>([]);
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  // Toggling
  const [toggling, setToggling] = useState(false);

  // Active tab
  const [tab, setTab] = useState<'bets' | 'rankings' | 'result'>('bets');

  // Search
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [betsRes, statusRes] = await Promise.all([
        fetch('/api/bets'),
        fetch('/api/status'),
      ]);
      const betsData = await betsRes.json();
      const statusData = await statusRes.json();
      if (betsData.bets) setBets(betsData.bets);
      setBettingOpen(statusData.bettingOpen);
      setHasResult(statusData.hasResult);
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }, []);

  const fetchRankings = useCallback(async () => {
    try {
      const res = await fetch('/api/rankings');
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchData();
    fetchRankings();
    const interval = setInterval(() => {
      fetchData();
      if (hasResult) fetchRankings();
    }, 10000);
    return () => clearInterval(interval);
  }, [authenticated, fetchData, fetchRankings, hasResult]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD }),
      });
      const data = await res.json();
      if (res.ok) {
        setBettingOpen(data.bettingOpen);
      }
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  const handleSaveResult = async () => {
    setSavingResult(true);
    try {
      const res = await fetch('/api/admin/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: ADMIN_PASSWORD,
          brazilScore: realBrazilScore,
          moroccoScore: realMoroccoScore,
          scorers: realScorers,
        }),
      });
      if (res.ok) {
        setResultSaved(true);
        setHasResult(true);
        await fetchRankings();
        setTab('rankings');
      }
    } catch {
      // silent
    } finally {
      setSavingResult(false);
    }
  };

  const toggleRealScorer = (name: string) => {
    setRealScorers((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const filteredBets = search
    ? bets.filter((b) => b.instagram.toLowerCase().includes(search.toLowerCase()))
    : bets;

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#111] border-b border-[#1f1f1f] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Admin Pari Megarama</h1>
            <p className="text-xs text-gray-500">🇧🇷 Brésil vs Maroc 🇲🇦 — Coupe du Monde 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-600 hidden sm:block">
                Mis à jour {lastRefresh.toLocaleTimeString('fr-FR')}
              </span>
            )}
            <button
              onClick={fetchData}
              className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-400 transition-all"
              title="Rafraîchir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Paris</p>
            <p className="text-3xl font-black text-white">{bets.length}</p>
          </div>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Statut</p>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${bettingOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className={`text-sm font-bold ${bettingOpen ? 'text-green-400' : 'text-red-400'}`}>
                {bettingOpen ? 'OUVERT' : 'FERMÉ'}
              </span>
            </div>
          </div>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Résultat</p>
            <p className={`text-sm font-bold ${hasResult ? 'text-green-400' : 'text-gray-600'}`}>
              {hasResult ? '✓ Saisi' : '— Non saisi'}
            </p>
          </div>
          <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Gagnants (top 5)</p>
            <p className="text-sm font-bold text-white">
              {hasResult ? `${rankings.filter(r => r.rank <= 5).length} joueurs` : '—'}
            </p>
          </div>
        </div>

        {/* Toggle button */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all border ${
              bettingOpen
                ? 'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20'
                : 'bg-green-500/10 border-green-500/40 text-green-400 hover:bg-green-500/20'
            } disabled:opacity-50`}
          >
            {toggling ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{bettingOpen ? '🔒' : '🔓'}</span>
            )}
            {bettingOpen ? 'Fermer les paris' : 'Ouvrir les paris'}
          </button>

          <button
            onClick={() => exportToCSV(bets, hasResult ? rankings : undefined)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-[#1f1f1f] rounded-xl p-1 mb-6">
          {[
            { key: 'bets', label: `Paris (${bets.length})` },
            { key: 'rankings', label: 'Classement' },
            { key: 'result', label: 'Saisir résultat' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Bets */}
        {tab === 'bets' && (
          <div className="animate-fade-in">
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par Instagram..."
                className="w-full max-w-xs bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-green-500/60 transition-colors"
              />
            </div>

            {filteredBets.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <p className="text-5xl mb-4">⚽</p>
                <p className="font-semibold">Aucun pari pour l'instant</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-[#1f1f1f]">
                      <th className="text-left py-3 px-4 font-semibold">#</th>
                      <th className="text-left py-3 px-4 font-semibold">Instagram</th>
                      <th className="text-left py-3 px-4 font-semibold">Score</th>
                      <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Résultat</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Buteurs</th>
                      <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111]">
                    {filteredBets.map((bet, i) => {
                      const { label, color } = getResultLabel(bet.brazilScore, bet.moroccoScore);
                      return (
                        <tr key={bet.id} className="hover:bg-[#111] transition-colors">
                          <td className="py-3 px-4 text-gray-600 text-xs">{i + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white">@{bet.instagram}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white font-mono">
                              {bet.brazilScore} — {bet.moroccoScore}
                            </span>
                          </td>
                          <td className={`py-3 px-4 text-xs font-semibold hidden sm:table-cell ${color}`}>{label}</td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-gray-400 text-xs">
                              {bet.scorers.length > 0
                                ? bet.scorers.length <= 3
                                  ? bet.scorers.join(', ')
                                  : `${bet.scorers.slice(0, 3).join(', ')} +${bet.scorers.length - 3}`
                                : <span className="text-gray-600">—</span>
                              }
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs hidden lg:table-cell">
                            {formatDate(bet.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Rankings */}
        {tab === 'rankings' && (
          <div className="animate-fade-in">
            {!hasResult ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🏆</p>
                <p className="text-gray-500 font-semibold mb-2">Résultat non encore saisi</p>
                <p className="text-gray-600 text-sm">Saisissez le résultat du match pour afficher le classement</p>
                <button
                  onClick={() => setTab('result')}
                  className="mt-4 px-5 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/20 transition-all"
                >
                  Saisir le résultat →
                </button>
              </div>
            ) : rankings.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <p className="text-5xl mb-4">🏆</p>
                <p className="font-semibold">Aucun pari à classer</p>
              </div>
            ) : (
              <div>
                {/* Top 5 winners */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    🥇 Top 5 — Gagnants
                  </h3>
                  <div className="space-y-2">
                    {rankings.filter(r => r.rank <= 5).map((r) => (
                      <div
                        key={r.id}
                        className={`bg-[#111] border rounded-xl px-4 py-3 flex items-center gap-4 ${
                          r.rank === 1 ? 'border-yellow-500/40' : r.rank === 2 ? 'border-gray-400/30' : r.rank === 3 ? 'border-amber-700/40' : 'border-[#1f1f1f]'
                        }`}
                      >
                        <span className="text-2xl w-8 text-center flex-shrink-0">
                          {r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : `#${r.rank}`}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white">@{r.instagram}</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.resultCorrect ? 'bg-green-500/15 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {r.resultCorrect ? '✓ Résultat' : '✗ Résultat'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.scoreExact ? 'bg-green-500/15 text-green-400' : 'bg-[#1a1a1a] text-gray-500'}`}>
                              {r.scoreExact ? '✓ Score exact' : '✗ Score exact'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-gray-400 font-medium">
                              ⚽ {r.scorersMatched}/{r.scorersTotal} buteur{r.scorersTotal > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-white font-mono text-sm">
                            {r.brazilScore}–{r.moroccoScore}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full rankings table */}
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Classement complet
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-[#1f1f1f]">
                        <th className="text-left py-3 px-3 font-semibold">Rang</th>
                        <th className="text-left py-3 px-3 font-semibold">Instagram</th>
                        <th className="text-left py-3 px-3 font-semibold">Score</th>
                        <th className="text-left py-3 px-3 font-semibold hidden sm:table-cell">Résultat</th>
                        <th className="text-left py-3 px-3 font-semibold hidden sm:table-cell">Exact</th>
                        <th className="text-left py-3 px-3 font-semibold">Buteurs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0f0f0f]">
                      {rankings.map((r) => (
                        <tr key={r.id} className={`hover:bg-[#0f0f0f] transition-colors ${r.rank <= 5 ? 'bg-green-500/5' : ''}`}>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                              #{r.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">@{r.instagram}</td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{r.brazilScore}–{r.moroccoScore}</td>
                          <td className={`py-3 px-3 text-xs font-semibold hidden sm:table-cell ${r.resultCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {r.resultCorrect ? '✓' : '✗'}
                          </td>
                          <td className={`py-3 px-3 text-xs font-semibold hidden sm:table-cell ${r.scoreExact ? 'text-green-400' : 'text-gray-600'}`}>
                            {r.scoreExact ? '✓' : '—'}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-semibold ${r.scorersMatched > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                              {r.scorersMatched}/{r.scorersTotal}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Result */}
        {tab === 'result' && (
          <div className="animate-fade-in max-w-2xl">
            {resultSaved && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="text-green-400 text-xl">✓</span>
                <p className="text-green-400 font-semibold text-sm">Résultat saisi avec succès ! Le classement a été calculé.</p>
              </div>
            )}

            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
              <h3 className="text-base font-bold text-white mb-5">Score réel du match</h3>

              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-semibold">🇧🇷 Brésil</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRealBrazilScore(Math.max(0, realBrazilScore - 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >—</button>
                    <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl py-3 text-center text-3xl font-black text-white">
                      {realBrazilScore}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealBrazilScore(Math.min(20, realBrazilScore + 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >+</button>
                  </div>
                </div>
                <div className="text-gray-600 text-2xl font-light mt-5">:</div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-semibold">🇲🇦 Maroc</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRealMoroccoScore(Math.max(0, realMoroccoScore - 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >—</button>
                    <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl py-3 text-center text-3xl font-black text-white">
                      {realMoroccoScore}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealMoroccoScore(Math.min(20, realMoroccoScore + 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">
                  → {getResultLabel(realBrazilScore, realMoroccoScore).label}
                </span>
              </div>
            </div>

            {/* Real scorers */}
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
              <h3 className="text-base font-bold text-white mb-2">Buteurs réels</h3>
              <p className="text-xs text-gray-500 mb-5">
                {realScorers.length} joueur{realScorers.length > 1 ? 's' : ''} sélectionné{realScorers.length > 1 ? 's' : ''}
              </p>

              {realScorers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {realScorers.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-2.5 py-1.5 font-medium"
                    >
                      {s}
                      <button
                        onClick={() => toggleRealScorer(s)}
                        className="text-green-600 hover:text-red-400 transition-colors"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}

              {/* Brésil */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">🇧🇷 Brésil</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {BRAZIL_PLAYERS.filter(p => p.position !== 'GK').map((player) => (
                    <button
                      key={player.name}
                      type="button"
                      onClick={() => toggleRealScorer(player.name)}
                      className={`text-left text-xs px-3 py-2 rounded-lg transition-all border ${
                        realScorers.includes(player.name)
                          ? 'bg-green-500/15 border-green-500/40 text-green-400 font-semibold'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Maroc */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">🇲🇦 Maroc</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MOROCCO_PLAYERS.filter(p => p.position !== 'GK').map((player) => (
                    <button
                      key={player.name}
                      type="button"
                      onClick={() => toggleRealScorer(player.name)}
                      className={`text-left text-xs px-3 py-2 rounded-lg transition-all border ${
                        realScorers.includes(player.name)
                          ? 'bg-green-500/15 border-green-500/40 text-green-400 font-semibold'
                          : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveResult}
              disabled={savingResult}
              className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] shadow-lg shadow-green-500/20 disabled:shadow-none"
            >
              {savingResult ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Calcul en cours...
                </span>
              ) : (
                '🏆 Valider le résultat et calculer le classement'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
