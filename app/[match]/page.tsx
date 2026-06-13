'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getMatch, MatchInfo } from '@/lib/matches';
import { getSquad, Player } from '@/lib/squads';

type Step = 1 | 2 | 3;
type TeamTab = 'team1' | 'team2';

interface BetSummary {
  instagram: string;
  firstName: string;
  lastName: string;
  team1Score: number;
  team2Score: number;
  scorers: string[];
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayerSilhouette({ goalCount }: { goalCount: number }) {
  return (
    <svg
      viewBox="0 0 32 44"
      fill="currentColor"
      className={`w-6 h-9 transition-all duration-200 drop-shadow-sm ${
        goalCount > 0 ? 'text-[#FFD700]' : 'text-white/70'
      }`}
    >
      <circle cx="16" cy="8" r="6.5" />
      <path d="M5 20 C5 15 9 14 16 14 C23 14 27 15 27 20 L28 40 C28 42 24 43 16 43 C8 43 4 42 4 40 Z" />
    </svg>
  );
}

function FormationPlayer({
  player,
  goalCount,
  onTap,
}: {
  player: Player;
  goalCount: number;
  onTap: (name: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onTap(player.name)}
      className="flex flex-col items-center gap-0.5 group relative"
      style={{ minWidth: '44px', maxWidth: '52px' }}
    >
      <div
        className={`relative p-0.5 rounded-full transition-all duration-200 ${
          goalCount > 0 ? 'bg-[#FFD700]/25' : 'hover:bg-white/10'
        }`}
        style={goalCount > 0 ? { boxShadow: '0 0 10px rgba(255,215,0,0.45)' } : {}}
      >
        <PlayerSilhouette goalCount={goalCount} />
        {goalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#FFD700] rounded-full flex items-center justify-center shadow text-black font-black" style={{ fontSize: '8px' }}>
            {goalCount}
          </span>
        )}
      </div>
      <span
        className={`text-center leading-tight font-semibold transition-colors duration-200 ${
          goalCount > 0 ? 'text-[#FFD700]' : 'text-white/80'
        }`}
        style={{ fontSize: '8px', maxWidth: '48px' }}
      >
        {player.shortName}
      </span>
    </button>
  );
}

function PitchFormation({
  players,
  selectedScorers,
  onTap,
}: {
  players: Player[];
  selectedScorers: string[];
  onTap: (name: string) => void;
}) {
  const starters = players.filter((p) => p.starter);
  const bench = players.filter((p) => !p.starter);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const dmid = starters.filter((p) => p.position === 'DMID');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  const rows = dmid.length > 0
    ? [fwd, mid, dmid, def, gk]
    : [fwd, mid, def, gk];

  const countGoals = (name: string) => selectedScorers.filter((s) => s === name).length;

  return (
    <div className="space-y-3">
      {/* Pitch */}
      <div
        className="relative rounded-2xl overflow-hidden px-1 py-3"
        style={{
          background: 'linear-gradient(180deg, #1a7a35 0%, #1f8c3e 30%, #1f8c3e 70%, #1a7a35 100%)',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        >
          <rect x="5" y="5" width="90" height="190" />
          <line x1="5" y1="100" x2="95" y2="100" />
          <circle cx="50" cy="100" r="15" />
          <rect x="22" y="5" width="56" height="28" />
          <rect x="22" y="167" width="56" height="28" />
          <rect x="38" y="5" width="24" height="8" />
          <rect x="38" y="187" width="24" height="8" />
        </svg>

        <div className="relative flex flex-col gap-2">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-0.5">
              {row.map((player) => (
                <FormationPlayer
                  key={player.name}
                  player={player}
                  goalCount={countGoals(player.name)}
                  onTap={onTap}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bench */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 px-1">
          Remplaçants
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {bench.map((player) => (
            <div key={player.name} className="flex-shrink-0">
              <FormationPlayer
                player={player}
                goalCount={countGoals(player.name)}
                onTap={onTap}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { num: 1 as Step, label: 'Pseudo' },
    { num: 2 as Step, label: 'Score' },
    { num: 3 as Step, label: 'Buteurs' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 ${
                current > step.num
                  ? 'bg-[#FFD700] text-black'
                  : current === step.num
                  ? 'bg-[#FFD700] text-black shadow-lg'
                  : 'bg-[#1a1a1a] text-gray-600 border border-[#2a2a2a]'
              }`}
              style={current === step.num ? { boxShadow: '0 0 16px rgba(255,215,0,0.4)' } : {}}
            >
              {current > step.num ? <CheckIcon className="w-4 h-4" /> : step.num}
            </div>
            <span
              className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${
                current >= step.num ? 'text-[#FFD700]' : 'text-gray-700'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-px w-10 mx-1 mb-4 transition-all duration-300 ${
                current > step.num ? 'bg-[#FFD700]' : 'bg-[#2a2a2a]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreInput({
  label,
  flag,
  value,
  onChange,
}: {
  label: string;
  flag: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl">{flag}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center max-w-[80px] truncate">{label}</div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-lg font-bold hover:border-[#FFD700]/50 hover:bg-[#222] transition-all active:scale-95 flex items-center justify-center"
        >
          −
        </button>
        <div
          className="w-12 h-12 bg-black border-2 rounded-xl flex items-center justify-center"
          style={{ borderColor: 'rgba(255,215,0,0.4)' }}
        >
          <span className="text-3xl font-black text-white">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-lg font-bold hover:border-[#FFD700]/50 hover:bg-[#222] transition-all active:scale-95 flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function MatchBettingPage() {
  const params = useParams();
  const matchSlug = params.match as string;

  const match: MatchInfo | undefined = getMatch(matchSlug);

  const [step, setStep] = useState<Step>(1);
  const [instagram, setInstagram] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [selectedScorers, setSelectedScorers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBet, setSubmittedBet] = useState<BetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bettingOpen, setBettingOpen] = useState<boolean | null>(null);
  const [checkingInstagram, setCheckingInstagram] = useState(false);
  const [instagramError, setInstagramError] = useState('');
  const [activeTeam, setActiveTeam] = useState<TeamTab>('team1');

  useEffect(() => {
    if (!match) return;
    fetch(`/api/status?matchId=${match.slug}`)
      .then((r) => r.json())
      .then((d) => setBettingOpen(d.bettingOpen))
      .catch(() => setBettingOpen(false));
  }, [match]);

  const toggleScorer = useCallback((name: string) => {
    setSelectedScorers((prev) => {
      const count = prev.filter((s) => s === name).length;
      const without = prev.filter((s) => s !== name);
      // cycle: 0 → 1 → 2 → 3 → 0
      const next = count >= 3 ? 0 : count + 1;
      return [...without, ...Array(next).fill(name)];
    });
  }, []);

  const handleStep1Next = async () => {
    let hasError = false;
    if (!firstName.trim()) { setFirstNameError('Prénom requis'); hasError = true; }
    else setFirstNameError('');
    if (!lastName.trim()) { setLastNameError('Nom requis'); hasError = true; }
    else setLastNameError('');
    const clean = instagram.toLowerCase().trim();
    if (!clean) { setInstagramError('Email requis'); hasError = true; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) { setInstagramError('Adresse email invalide'); hasError = true; }
    else setInstagramError('');
    if (hasError) return;
    setCheckingInstagram(true);
    try {
      const res = await fetch(`/api/status?matchId=${match!.slug}`);
      const data = await res.json();
      if (!data.bettingOpen) { setBettingOpen(false); setCheckingInstagram(false); return; }
    } catch { /* continue */ }
    setCheckingInstagram(false);
    setInstagram(clean);
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match!.slug,
          instagram,
          firstName,
          lastName,
          team1Score,
          team2Score,
          scorers: selectedScorers,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur lors de la soumission'); setLoading(false); return; }
      setSubmittedBet({ instagram, firstName, lastName, team1Score, team2Score, scorers: selectedScorers });
      setSubmitted(true);
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const getResultLabel = (t1: number, t2: number) => {
    if (!match) return '';
    if (t1 > t2) return `Victoire ${match.team1.name} ${match.team1.flag}`;
    if (t2 > t1) return `Victoire ${match.team2.name} ${match.team2.flag}`;
    return 'Match nul ⚖️';
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❓</div>
          <h1 className="text-2xl font-black text-white mb-2">Match introuvable</h1>
          <p className="text-gray-500 text-sm mb-6">Ce match n'existe pas ou n'est pas disponible.</p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-bold text-black text-sm"
            style={{ background: '#FFD700' }}
          >
            ← Voir tous les matchs
          </a>
        </div>
      </div>
    );
  }

  const team1Squad = getSquad(match.team1.squadKey);
  const team2Squad = getSquad(match.team2.squadKey);

  const team1Selected = selectedScorers.filter((s) => team1Squad.some((p) => p.name === s)).length;
  const team2Selected = selectedScorers.filter((s) => team2Squad.some((p) => p.name === s)).length;
  const totalGoals = selectedScorers.length;

  if (bettingOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.08) 0%, transparent 70%)' }}
        />
        <div className="relative px-4 pt-8 pb-5 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border"
            style={{ background: 'rgba(255,215,0,0.08)', borderColor: 'rgba(255,215,0,0.2)' }}
          >
            <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
            <span className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest">
              Coupe du Monde 2026 — {match.group}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">
            Jeu <span style={{ color: '#FFD700' }}>Megarama</span>
          </h1>
          <p className="text-gray-400 text-base font-semibold mt-1">
            {match.team1.flag} {match.team1.name} — {match.team2.name} {match.team2.flag}
          </p>
          <p className="text-gray-600 text-xs mt-1">
            {match.date} à {match.time} · {match.city}
          </p>
        </div>
      </header>

      <main className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full pt-6">

        {/* Betting closed */}
        {!bettingOpen && !submitted && (
          <div className="animate-slide-up bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-white mb-2">Jeu fermé</h2>
            <p className="text-gray-500 text-sm">Le jeu est actuellement fermé.<br />Revenez avant le coup d'envoi !</p>
          </div>
        )}

        {/* Confirmation */}
        {submitted && submittedBet && (
          <div className="animate-slide-up">
            <div className="bg-[#111] border rounded-2xl p-6" style={{ borderColor: 'rgba(255,215,0,0.25)' }}>
              <div className="text-center mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(255,215,0,0.15)' }}
                >
                  <CheckIcon className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h2 className="text-xl font-black text-white">Sélection enregistrée !</h2>
                <p className="text-white font-bold mt-1">{submittedBet.firstName} {submittedBet.lastName.toUpperCase()}</p>
                <p className="text-gray-500 text-sm">{submittedBet.instagram} · Bonne chance 🎉</p>
              </div>

              <div className="bg-black rounded-xl p-4 mb-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-3">Ton pronostic</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-1">{match.team1.flag}</div>
                    <div className="text-4xl font-black text-white">{submittedBet.team1Score}</div>
                    <div className="text-xs text-gray-600 mt-1">{match.team1.name}</div>
                  </div>
                  <div className="text-gray-700 text-2xl">—</div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">{match.team2.flag}</div>
                    <div className="text-4xl font-black text-white">{submittedBet.team2Score}</div>
                    <div className="text-xs text-gray-600 mt-1">{match.team2.name}</div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <span
                    className="text-xs rounded-full px-3 py-1 font-bold"
                    style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}
                  >
                    {getResultLabel(submittedBet.team1Score, submittedBet.team2Score)}
                  </span>
                </div>
              </div>

              {submittedBet.scorers.length > 0 && (
                <div className="bg-black rounded-xl p-4">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-3">
                    Buteurs ({submittedBet.scorers.length} but{submittedBet.scorers.length > 1 ? 's' : ''})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(submittedBet.scorers)).map((scorer) => {
                      const count = submittedBet.scorers.filter((s) => s === scorer).length;
                      return (
                        <span
                          key={scorer}
                          className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-2.5 py-1.5 font-medium"
                        >
                          {scorer}{count > 1 ? ` ×${count}` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-700 text-center mt-5">
                Les résultats seront annoncés après le match
              </p>
            </div>
          </div>
        )}

        {/* Betting form */}
        {bettingOpen && !submitted && (
          <div className="animate-fade-in">
            <StepIndicator current={step} />

            {/* Step 1: Instagram */}
            {step === 1 && (
              <div className="animate-slide-up">
                <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
                  <h2 className="text-lg font-black text-white mb-1">Tes informations</h2>
                  <p className="text-[#FFD700]/80 text-xs font-semibold mb-2">Pronostique le résultat du match et les buteurs, et tente de remporter un lot offert par Megarama !</p>
                  <p className="text-gray-500 text-sm mb-5">Un seul pari par adresse email.</p>

                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); if (firstNameError) setFirstNameError(''); }}
                        placeholder="Prénom"
                        autoComplete="given-name"
                        className={`w-full bg-black border-2 rounded-xl px-4 py-3.5 text-white font-semibold placeholder-gray-700 focus:outline-none transition-colors ${
                          firstNameError ? 'border-red-500/50' : 'border-[#2a2a2a] focus:border-[#FFD700]/50'
                        }`}
                      />
                      {firstNameError && <p className="text-red-400 text-xs mt-1">⚠ {firstNameError}</p>}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => { setLastName(e.target.value); if (lastNameError) setLastNameError(''); }}
                        placeholder="Nom"
                        autoComplete="family-name"
                        className={`w-full bg-black border-2 rounded-xl px-4 py-3.5 text-white font-semibold placeholder-gray-700 focus:outline-none transition-colors ${
                          lastNameError ? 'border-red-500/50' : 'border-[#2a2a2a] focus:border-[#FFD700]/50'
                        }`}
                      />
                      {lastNameError && <p className="text-red-400 text-xs mt-1">⚠ {lastNameError}</p>}
                    </div>
                  </div>

                  <div className="relative mb-3">
                    <input
                      type="email"
                      value={instagram}
                      onChange={(e) => {
                        setInstagram(e.target.value);
                        if (instagramError) setInstagramError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStep1Next()}
                      placeholder="prenom@exemple.com"
                      autoComplete="email"
                      autoCapitalize="none"
                      className={`w-full bg-black border-2 rounded-xl px-4 py-3.5 text-white font-semibold placeholder-gray-700 focus:outline-none transition-colors ${
                        instagramError ? 'border-red-500/50' : 'border-[#2a2a2a] focus:border-[#FFD700]/50'
                      }`}
                    />
                  </div>
                  {instagramError && (
                    <p className="text-red-400 text-sm mt-1 mb-2">⚠ {instagramError}</p>
                  )}

                  <button
                    onClick={handleStep1Next}
                    disabled={checkingInstagram || !instagram.trim() || !firstName.trim() || !lastName.trim()}
                    className="w-full mt-3 font-black py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#FFD700', color: '#000' }}
                  >
                    {checkingInstagram ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Vérification...
                      </span>
                    ) : (
                      'Continuer →'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Score */}
            {step === 2 && (
              <div className="animate-slide-up">
                <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
                  <h2 className="text-lg font-black text-white mb-1">Pronostic du score</h2>
                  <p className="text-[#FFD700]/80 text-xs font-semibold mb-1">Pronostique le résultat du match et les buteurs, et tente de remporter un lot offert par Megarama !</p>
                  <p className="text-gray-500 text-sm mb-6">Quel sera le score final ?</p>

                  <div className="flex items-center justify-center gap-3 py-2">
                    <ScoreInput
                      label={match.team1.name}
                      flag={match.team1.flag}
                      value={team1Score}
                      onChange={setTeam1Score}
                    />
                    <div className="flex flex-col items-center gap-1 pb-4">
                      <span className="text-2xl text-gray-600 font-thin">:</span>
                      <span className="text-[9px] text-gray-500 font-bold text-center" style={{ maxWidth: '48px' }}>
                        {team1Score > team2Score
                          ? `${match.team1.flag} Gagne`
                          : team2Score > team1Score
                          ? `${match.team2.flag} Gagne`
                          : 'Nul'}
                      </span>
                    </div>
                    <ScoreInput
                      label={match.team2.name}
                      flag={match.team2.flag}
                      value={team2Score}
                      onChange={setTeam2Score}
                    />
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-400 font-bold py-4 rounded-xl transition-all text-sm"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-[2] font-black py-4 rounded-xl transition-all duration-200 active:scale-[0.98]"
                      style={{ background: '#FFD700', color: '#000' }}
                    >
                      Continuer →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Scorers */}
            {step === 3 && (
              <div className="animate-slide-up space-y-4">
                <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-4">
                  <h2 className="text-lg font-black text-white mb-1">Buteurs du match</h2>
                  <p className="text-[#FFD700]/80 text-xs font-semibold mb-1">Pronostique le résultat du match et les buteurs, et tente de remporter un lot offert par Megarama !</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Appuie sur un joueur pour ajouter un but (jusqu&apos;à 3). Appuie encore pour remettre à 0.{' '}
                    <span style={{ color: '#FFD700' }} className="font-bold">
                      {totalGoals} but{totalGoals > 1 ? 's' : ''} pariés
                    </span>
                  </p>

                  {/* Score recap */}
                  <div className="bg-black rounded-xl px-4 py-2.5 mb-4 flex items-center justify-center gap-4 border border-[#1a1a1a]">
                    <span className="text-gray-400 text-sm font-bold">
                      {match.team1.flag} {team1Score}
                    </span>
                    <span className="text-gray-700">—</span>
                    <span className="text-gray-400 text-sm font-bold">
                      {team2Score} {match.team2.flag}
                    </span>
                  </div>

                  {/* Team tabs */}
                  <div className="flex rounded-xl overflow-hidden border border-[#2a2a2a] mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveTeam('team1')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTeam === 'team1' ? 'text-black' : 'text-gray-500 bg-[#0a0a0a] hover:text-gray-300'
                      }`}
                      style={activeTeam === 'team1' ? { background: '#FFD700' } : {}}
                    >
                      {match.team1.flag} {match.team1.name}
                      {team1Selected > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                            activeTeam === 'team1' ? 'bg-black/20 text-black' : 'bg-[#FFD700]/20 text-[#FFD700]'
                          }`}
                        >
                          {team1Selected}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTeam('team2')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTeam === 'team2' ? 'text-black' : 'text-gray-500 bg-[#0a0a0a] hover:text-gray-300'
                      }`}
                      style={activeTeam === 'team2' ? { background: '#FFD700' } : {}}
                    >
                      {match.team2.flag} {match.team2.name}
                      {team2Selected > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                            activeTeam === 'team2' ? 'bg-black/20 text-black' : 'bg-[#FFD700]/20 text-[#FFD700]'
                          }`}
                        >
                          {team2Selected}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Formation view */}
                  {activeTeam === 'team1' && (
                    <PitchFormation
                      players={team1Squad}
                      selectedScorers={selectedScorers}
                      onTap={toggleScorer}
                    />
                  )}
                  {activeTeam === 'team2' && (
                    <PitchFormation
                      players={team2Squad}
                      selectedScorers={selectedScorers}
                      onTap={toggleScorer}
                    />
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium text-center">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-400 font-bold py-4 rounded-xl transition-all text-sm disabled:opacity-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] font-black py-4 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                    style={{ background: '#FFD700', color: '#000' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Envoi...
                      </span>
                    ) : (
                      'Valider ma sélection'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="text-center py-5 px-4 border-t border-[#0f0f0f]">
        <p className="text-gray-800 text-xs font-medium">Megarama © 2026 — Coupe du Monde</p>
      </footer>
    </div>
  );
}
