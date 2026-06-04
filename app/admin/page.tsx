'use client';

import { useState, useEffect, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { MATCHES, MatchInfo } from '@/lib/matches';
import { getSquad } from '@/lib/squads';

const BASE_URL = 'https://paris-megarama.vercel.app';

const ADMIN_PASSWORD = 'megarama2026';

interface Bet {
  id: string;
  matchId: string;
  instagram: string;
  firstName: string;
  lastName: string;
  team1Score: number;
  team2Score: number;
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

function getResultLabel(match: MatchInfo, t1: number, t2: number) {
  if (t1 > t2) return { label: `${match.team1.name} ${match.team1.flag}`, color: 'text-yellow-400' };
  if (t2 > t1) return { label: `${match.team2.name} ${match.team2.flag}`, color: 'text-blue-400' };
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

function formatScorers(scorers: string[]): string {
  const counts: Record<string, number> = {};
  for (const s of scorers) counts[s] = (counts[s] || 0) + 1;
  return Object.entries(counts)
    .map(([name, n]) => (n > 1 ? `${name} ×${n}` : name))
    .join(', ');
}

function exportToCSV(match: MatchInfo, bets: Bet[], rankings?: RankedBet[]) {
  const matchLabel = `${match.team1.name} vs ${match.team2.name}`;
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;

  let rows: string[][];

  if (rankings && rankings.length > 0) {
    const header = [
      'Match', 'Groupe', 'Date', 'Ville',
      'Rang', 'Prénom', 'Nom', 'Instagram',
      `Score ${match.team1.name}`, `Score ${match.team2.name}`,
      'Résultat correct', 'Score exact',
      'Nb buteurs corrects', 'Nb buteurs pariés', 'Buteurs choisis',
      'Soumis le',
    ];
    rows = [header];
    for (const r of rankings) {
      rows.push([
        matchLabel, match.group, match.date, match.city,
        String(r.rank), r.firstName || '', r.lastName || '', `@${r.instagram}`,
        String(r.team1Score), String(r.team2Score),
        r.resultCorrect ? 'Oui' : 'Non',
        r.scoreExact ? 'Oui' : 'Non',
        String(r.scorersMatched), String(r.scorersTotal), formatScorers(r.scorers),
        formatDate(r.createdAt),
      ]);
    }
  } else {
    const header = [
      'Match', 'Groupe', 'Date', 'Ville',
      'Prénom', 'Nom', 'Instagram',
      `Score ${match.team1.name}`, `Score ${match.team2.name}`,
      'Résultat prédit', 'Nb buteurs pariés', 'Buteurs choisis',
      'Soumis le',
    ];
    rows = [header];
    for (const b of bets) {
      const result = b.team1Score > b.team2Score
        ? `Victoire ${match.team1.name}`
        : b.team2Score > b.team1Score
        ? `Victoire ${match.team2.name}`
        : 'Match nul';
      rows.push([
        matchLabel, match.group, match.date, match.city,
        b.firstName || '', b.lastName || '', `@${b.instagram}`,
        String(b.team1Score), String(b.team2Score),
        result, String(b.scorers.length), formatScorers(b.scorers),
        formatDate(b.createdAt),
      ]);
    }
  }

  const csv = rows.map((row) => row.map(cell).join(';')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jeu-megarama-${match.slug}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
            className="w-full bg-[#0a0a0a] border-2 border-[#2a2a2a] focus:border-[#FFD700]/60 rounded-xl px-4 py-4 text-white placeholder-gray-700 focus:outline-none transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={!password}
            className="w-full disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all"
            style={{ background: '#FFD700' }}
          >
            Connexion
          </button>
        </div>
      </div>
    </div>
  );
}

function QRCodesTab() {
  const handleDownload = () => {
    const canvas = document.querySelector('#qr-central canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qr-jeu-megarama.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="text-center">
        <h3 className="text-lg font-black text-white mb-1">QR Code Central</h3>
        <p className="text-gray-500 text-sm">Affiche ce QR code pour tous les matchs — les clients choisissent le bon sur la page d'accueil.</p>
      </div>

      <div
        id="qr-central"
        className="rounded-2xl p-5"
        style={{ background: '#000', border: '2px solid rgba(255,215,0,0.3)' }}
      >
        <QRCodeCanvas
          value={BASE_URL}
          size={240}
          bgColor="#000000"
          fgColor="#FFD700"
          level="M"
        />
      </div>

      <p className="text-xs text-gray-600">{BASE_URL}</p>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm border transition-all"
        style={{ borderColor: 'rgba(255,215,0,0.4)', color: '#FFD700', background: 'rgba(255,215,0,0.08)' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Télécharger PNG
      </button>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [selectedMatchSlug, setSelectedMatchSlug] = useState<string>(MATCHES[0].slug);
  const [bets, setBets] = useState<Bet[]>([]);
  const [bettingOpen, setBettingOpen] = useState(true);
  const [rankings, setRankings] = useState<RankedBet[]>([]);
  const [hasResult, setHasResult] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Result form state
  const [realTeam1Score, setRealTeam1Score] = useState(0);
  const [realTeam2Score, setRealTeam2Score] = useState(0);
  const [realScorers, setRealScorers] = useState<string[]>([]);
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const [toggling, setToggling] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tab, setTab] = useState<'bets' | 'rankings' | 'result' | 'qrcodes'>('bets');
  const [search, setSearch] = useState('');

  const selectedMatch = MATCHES.find((m) => m.slug === selectedMatchSlug) ?? MATCHES[0];

  const fetchData = useCallback(async (matchId: string) => {
    try {
      const [betsRes, statusRes] = await Promise.all([
        fetch(`/api/bets?matchId=${matchId}`),
        fetch(`/api/status?matchId=${matchId}`),
      ]);
      const betsData = await betsRes.json();
      const statusData = await statusRes.json();
      if (betsData.bets) setBets(betsData.bets);
      setBettingOpen(statusData.bettingOpen ?? true);
      setHasResult(statusData.hasResult ?? false);
      setLastRefresh(new Date());
    } catch {
      // silent
    }
  }, []);

  const fetchRankings = useCallback(async (matchId: string) => {
    try {
      const res = await fetch(`/api/rankings?matchId=${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setRankings(data.rankings || []);
      } else {
        setRankings([]);
      }
    } catch {
      setRankings([]);
    }
  }, []);

  // When match changes, reset state and fetch fresh data
  useEffect(() => {
    if (!authenticated) return;
    setBets([]);
    setRankings([]);
    setHasResult(false);
    setRealTeam1Score(0);
    setRealTeam2Score(0);
    setRealScorers([]);
    setResultSaved(false);
    setTab('bets');
    setSearch('');
    fetchData(selectedMatchSlug);
    fetchRankings(selectedMatchSlug);
  }, [authenticated, selectedMatchSlug, fetchData, fetchRankings]);

  // Auto-refresh every 10s
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      fetchData(selectedMatchSlug);
      if (hasResult) fetchRankings(selectedMatchSlug);
    }, 10000);
    return () => clearInterval(interval);
  }, [authenticated, selectedMatchSlug, fetchData, fetchRankings, hasResult]);

  const handleReset = async () => {
    const confirmed = window.confirm(
      `⚠️ Réinitialiser "${selectedMatch.team1.name} vs ${selectedMatch.team2.name}" ?\n\nCela supprimera TOUS les paris de ce match et rouvrira les paris.\n\nCette action est irréversible.`
    );
    if (!confirmed) return;
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD, matchId: selectedMatchSlug }),
      });
      if (res.ok) {
        setBets([]);
        setRankings([]);
        setBettingOpen(true);
        setHasResult(false);
        setRealTeam1Score(0);
        setRealTeam2Score(0);
        setRealScorers([]);
        setResultSaved(false);
        setTab('bets');
      }
    } catch {
      // silent
    } finally {
      setResetting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/admin/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASSWORD, matchId: selectedMatchSlug }),
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
          matchId: selectedMatchSlug,
          team1Score: realTeam1Score,
          team2Score: realTeam2Score,
          scorers: realScorers,
        }),
      });
      if (res.ok) {
        setResultSaved(true);
        setHasResult(true);
        await fetchRankings(selectedMatchSlug);
        setTab('rankings');
      }
    } catch {
      // silent
    } finally {
      setSavingResult(false);
    }
  };

  const toggleRealScorer = (name: string) => {
    setRealScorers((prev) => {
      const count = prev.filter((s) => s === name).length;
      const without = prev.filter((s) => s !== name);
      const next = count >= 3 ? 0 : count + 1;
      return [...without, ...Array(next).fill(name)];
    });
  };

  const removeOneRealScorer = (name: string) => {
    setRealScorers((prev) => {
      const idx = prev.lastIndexOf(name);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const filteredBets = search
    ? bets.filter((b) => b.instagram.toLowerCase().includes(search.toLowerCase()))
    : bets;

  const team1Squad = getSquad(selectedMatch.team1.squadKey);
  const team2Squad = getSquad(selectedMatch.team2.squadKey);

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
            <p className="text-xs text-gray-500">Coupe du Monde 2026</p>
          </div>
          <div className="flex items-center gap-3">
            {lastRefresh && (
              <span className="text-xs text-gray-600 hidden sm:block">
                Mis à jour {lastRefresh.toLocaleTimeString('fr-FR')}
              </span>
            )}
            <button
              onClick={() => { fetchData(selectedMatchSlug); fetchRankings(selectedMatchSlug); }}
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

        {/* Match selector */}
        <div className="mb-6">
          <label className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 block">
            Match sélectionné
          </label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {MATCHES.map((match) => (
              <button
                key={match.slug}
                onClick={() => setSelectedMatchSlug(match.slug)}
                className={`text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  selectedMatchSlug === match.slug
                    ? 'border-[#FFD700]/50 text-black font-bold'
                    : 'border-[#1f1f1f] bg-[#111] text-gray-400 hover:border-[#2a2a2a] hover:text-gray-200'
                }`}
                style={selectedMatchSlug === match.slug ? { background: '#FFD700' } : {}}
              >
                <div className="font-bold">
                  {match.team1.flag} {match.team1.name} vs {match.team2.name} {match.team2.flag}
                </div>
                <div className={`text-xs mt-0.5 ${selectedMatchSlug === match.slug ? 'text-black/60' : 'text-gray-600'}`}>
                  {match.date} · {match.time} · {match.city}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Match header */}
        <div
          className="rounded-2xl border border-[#1f1f1f] px-5 py-4 mb-6 flex items-center gap-3"
          style={{ background: 'rgba(255,215,0,0.04)' }}
        >
          <div className="text-2xl">{selectedMatch.team1.flag}</div>
          <div>
            <p className="font-black text-white text-base">
              {selectedMatch.team1.name} vs {selectedMatch.team2.name}
            </p>
            <p className="text-xs text-gray-500">{selectedMatch.date} · {selectedMatch.time} · {selectedMatch.city} · {selectedMatch.group}</p>
          </div>
          <div className="text-2xl ml-auto">{selectedMatch.team2.flag}</div>
        </div>

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
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Top 5</p>
            <p className="text-sm font-bold text-white">
              {hasResult ? `${rankings.filter(r => r.rank <= 5).length} joueurs` : '—'}
            </p>
          </div>
        </div>

        {/* Actions */}
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
            onClick={() => exportToCSV(selectedMatch, bets, hasResult ? rankings : undefined)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-[#2a2a2a] text-gray-400 hover:bg-[#1a1a1a] transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exporter CSV
          </button>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-50 ml-auto"
          >
            {resetting ? (
              <span className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Réinitialiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-[#1f1f1f] rounded-xl p-1 mb-6">
          {[
            { key: 'bets', label: `Paris (${bets.length})` },
            { key: 'rankings', label: 'Classement' },
            { key: 'result', label: 'Résultat' },
            { key: 'qrcodes', label: '⬛ QR Codes' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'text-black shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              style={tab === t.key ? { background: '#FFD700' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Bets */}
        {tab === 'bets' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par Instagram..."
                className="w-full max-w-xs bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#FFD700]/60 transition-colors"
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
                      <th className="text-left py-3 px-4 font-semibold">Nom</th>
                      <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Instagram</th>
                      <th className="text-left py-3 px-4 font-semibold">Score</th>
                      <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Résultat</th>
                      <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Buteurs</th>
                      <th className="text-left py-3 px-4 font-semibold hidden lg:table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#111]">
                    {filteredBets.map((bet, i) => {
                      const { label, color } = getResultLabel(selectedMatch, bet.team1Score, bet.team2Score);
                      return (
                        <tr key={bet.id} className="hover:bg-[#111] transition-colors">
                          <td className="py-3 px-4 text-gray-600 text-xs">{i + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white">{bet.firstName} {bet.lastName}</span>
                            <span className="block text-gray-500 text-xs sm:hidden">@{bet.instagram}</span>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span className="text-gray-400 text-sm">@{bet.instagram}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-white font-mono">
                              {bet.team1Score} — {bet.team2Score}
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
          <div>
            {!hasResult ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🏆</p>
                <p className="text-gray-500 font-semibold mb-2">Résultat non encore saisi</p>
                <p className="text-gray-600 text-sm">Saisissez le résultat du match pour afficher le classement</p>
                <button
                  onClick={() => setTab('result')}
                  className="mt-4 px-5 py-3 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] rounded-xl text-sm font-semibold hover:bg-[#FFD700]/20 transition-all"
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
                            {r.team1Score}–{r.team2Score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                        <tr key={r.id} className={`hover:bg-[#0f0f0f] transition-colors ${r.rank <= 5 ? 'bg-[#FFD700]/5' : ''}`}>
                          <td className="py-3 px-3">
                            <span className={`font-bold ${r.rank === 1 ? 'text-yellow-400' : r.rank === 2 ? 'text-gray-300' : r.rank === 3 ? 'text-amber-600' : 'text-gray-600'}`}>
                              #{r.rank}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-white">@{r.instagram}</td>
                          <td className="py-3 px-3 font-mono font-bold text-white">{r.team1Score}–{r.team2Score}</td>
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

        {/* Tab: QR Codes */}
        {tab === 'qrcodes' && <QRCodesTab />}

        {/* Tab: Result */}
        {tab === 'result' && (
          <div className="max-w-2xl">
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
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-semibold">
                    {selectedMatch.team1.flag} {selectedMatch.team1.name}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRealTeam1Score(Math.max(0, realTeam1Score - 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >—</button>
                    <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl py-3 text-center text-3xl font-black text-white">
                      {realTeam1Score}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealTeam1Score(Math.min(20, realTeam1Score + 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >+</button>
                  </div>
                </div>
                <div className="text-gray-600 text-2xl font-light mt-5">:</div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 uppercase tracking-wider mb-2 block font-semibold">
                    {selectedMatch.team2.flag} {selectedMatch.team2.name}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRealTeam2Score(Math.max(0, realTeam2Score - 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >—</button>
                    <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl py-3 text-center text-3xl font-black text-white">
                      {realTeam2Score}
                    </div>
                    <button
                      type="button"
                      onClick={() => setRealTeam2Score(Math.min(20, realTeam2Score + 1))}
                      className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-bold hover:bg-[#222] transition-all"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-xs text-gray-500">
                  → {getResultLabel(selectedMatch, realTeam1Score, realTeam2Score).label}
                </span>
              </div>
            </div>

            {/* Real scorers */}
            <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6 mb-6">
              <h3 className="text-base font-bold text-white mb-2">Buteurs réels</h3>
              <p className="text-xs text-gray-500 mb-5">
                {realScorers.length} but{realScorers.length > 1 ? 's' : ''} — cliquez sur un joueur pour ajouter un but (jusqu'à 3), recliquez pour remettre à 0
              </p>

              {realScorers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {Array.from(new Set(realScorers)).map((s) => {
                    const count = realScorers.filter((r) => r === s).length;
                    return (
                      <span
                        key={s}
                        className="flex items-center gap-1.5 text-xs bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-2.5 py-1.5 font-medium"
                      >
                        {s}{count > 1 && <strong className="text-green-300"> ×{count}</strong>}
                        <button
                          onClick={() => removeOneRealScorer(s)}
                          className="text-green-600 hover:text-red-400 transition-colors ml-0.5"
                        >×</button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Team 1 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  {selectedMatch.team1.flag} {selectedMatch.team1.name}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {team1Squad.filter(p => p.position !== 'GK').map((player) => {
                    const count = realScorers.filter((s) => s === player.name).length;
                    return (
                      <button
                        key={player.name}
                        type="button"
                        onClick={() => toggleRealScorer(player.name)}
                        className={`text-left text-xs px-3 py-2 rounded-lg transition-all border flex items-center justify-between ${
                          count > 0
                            ? 'bg-green-500/15 border-green-500/40 text-green-400 font-semibold'
                            : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                        }`}
                      >
                        <span>{player.name}{!player.starter && <span className="text-gray-600 ml-1">(R)</span>}</span>
                        {count > 0 && (
                          <span className="ml-2 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Team 2 */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
                  {selectedMatch.team2.flag} {selectedMatch.team2.name}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {team2Squad.filter(p => p.position !== 'GK').map((player) => {
                    const count = realScorers.filter((s) => s === player.name).length;
                    return (
                      <button
                        key={player.name}
                        type="button"
                        onClick={() => toggleRealScorer(player.name)}
                        className={`text-left text-xs px-3 py-2 rounded-lg transition-all border flex items-center justify-between ${
                          count > 0
                            ? 'bg-green-500/15 border-green-500/40 text-green-400 font-semibold'
                            : 'bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a]'
                        }`}
                      >
                        <span>{player.name}{!player.starter && <span className="text-gray-600 ml-1">(R)</span>}</span>
                        {count > 0 && (
                          <span className="ml-2 w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
