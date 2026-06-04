'use client';

import { useState, useEffect, useCallback } from 'react';
import { BRAZIL_PLAYERS, MOROCCO_PLAYERS, Player } from '@/lib/players';

type Step = 1 | 2 | 3;
type TeamTab = 'brazil' | 'morocco';

interface BetSummary {
  instagram: string;
  brazilScore: number;
  moroccoScore: number;
  scorers: string[];
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PlayerSilhouette({ selected }: { selected: boolean }) {
  return (
    <svg
      viewBox="0 0 32 44"
      fill="currentColor"
      className={`w-8 h-11 transition-all duration-200 drop-shadow-sm ${
        selected ? 'text-[#FFD700]' : 'text-white/70'
      }`}
    >
      <circle cx="16" cy="8" r="6.5" />
      <path d="M5 20 C5 15 9 14 16 14 C23 14 27 15 27 20 L28 40 C28 42 24 43 16 43 C8 43 4 42 4 40 Z" />
    </svg>
  );
}

function FormationPlayer({
  player,
  selected,
  onToggle,
}: {
  player: Player;
  selected: boolean;
  onToggle: (name: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(player.name)}
      className="flex flex-col items-center gap-0.5 group relative"
      style={{ minWidth: '56px' }}
    >
      <div
        className={`relative p-1 rounded-full transition-all duration-200 ${
          selected
            ? 'bg-[#FFD700]/25 shadow-lg'
            : 'hover:bg-white/10'
        }`}
        style={selected ? { boxShadow: '0 0 12px rgba(255,215,0,0.5)' } : {}}
      >
        <PlayerSilhouette selected={selected} />
        {selected && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFD700] rounded-full flex items-center justify-center shadow">
            <CheckIcon className="w-2.5 h-2.5 text-black" />
          </span>
        )}
      </div>
      <span
        className={`text-center leading-tight font-semibold transition-colors duration-200 ${
          selected ? 'text-[#FFD700]' : 'text-white/80'
        }`}
        style={{ fontSize: '9px', maxWidth: '56px' }}
      >
        {player.shortName}
      </span>
    </button>
  );
}

function PitchFormation({
  players,
  selectedScorers,
  onToggle,
}: {
  players: Player[];
  selectedScorers: string[];
  onToggle: (name: string) => void;
}) {
  const starters = players.filter((p) => p.starter);
  const bench = players.filter((p) => !p.starter);

  const gk = starters.filter((p) => p.position === 'GK');
  const def = starters.filter((p) => p.position === 'DEF');
  const mid = starters.filter((p) => p.position === 'MID');
  const fwd = starters.filter((p) => p.position === 'FWD');

  const rows = [fwd, mid, def, gk];

  return (
    <div className="space-y-3">
      {/* Pitch */}
      <div
        className="relative rounded-2xl overflow-hidden px-2 py-5"
        style={{
          background: 'linear-gradient(180deg, #1a7a35 0%, #1f8c3e 30%, #1f8c3e 70%, #1a7a35 100%)',
        }}
      >
        {/* Pitch markings */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 200"
          preserveAspectRatio="none"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.8"
        >
          {/* Border */}
          <rect x="5" y="5" width="90" height="190" />
          {/* Center line */}
          <line x1="5" y1="100" x2="95" y2="100" />
          {/* Center circle */}
          <circle cx="50" cy="100" r="15" />
          {/* Top penalty area */}
          <rect x="22" y="5" width="56" height="28" />
          {/* Bottom penalty area */}
          <rect x="22" y="167" width="56" height="28" />
          {/* Top goal */}
          <rect x="38" y="5" width="24" height="8" />
          {/* Bottom goal */}
          <rect x="38" y="187" width="24" height="8" />
        </svg>

        {/* Formation rows — FWD at top, GK at bottom */}
        <div className="relative flex flex-col gap-4">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1">
              {row.map((player) => (
                <FormationPlayer
                  key={player.name}
                  player={player}
                  selected={selectedScorers.includes(player.name)}
                  onToggle={onToggle}
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
                selected={selectedScorers.includes(player.name)}
                onToggle={onToggle}
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
    <div className="flex flex-col items-center gap-3">
      <div className="text-4xl">{flag}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xl font-bold hover:border-[#FFD700]/50 hover:bg-[#222] transition-all active:scale-95"
        >
          −
        </button>
        <div
          className="w-16 h-16 bg-black border-2 rounded-2xl flex items-center justify-center"
          style={{ borderColor: 'rgba(255,215,0,0.4)' }}
        >
          <span className="text-4xl font-black text-white">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xl font-bold hover:border-[#FFD700]/50 hover:bg-[#222] transition-all active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BettingPage() {
  const [step, setStep] = useState<Step>(1);
  const [instagram, setInstagram] = useState('');
  const [brazilScore, setBrazilScore] = useState(0);
  const [moroccoScore, setMoroccoScore] = useState(0);
  const [selectedScorers, setSelectedScorers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBet, setSubmittedBet] = useState<BetSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bettingOpen, setBettingOpen] = useState<boolean | null>(null);
  const [checkingInstagram, setCheckingInstagram] = useState(false);
  const [instagramError, setInstagramError] = useState('');
  const [activeTeam, setActiveTeam] = useState<TeamTab>('brazil');

  useEffect(() => {
    fetch('/api/status')
      .then((r) => r.json())
      .then((d) => setBettingOpen(d.bettingOpen))
      .catch(() => setBettingOpen(false));
  }, []);

  const toggleScorer = useCallback((name: string) => {
    setSelectedScorers((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  }, []);

  const handleStep1Next = async () => {
    const clean = instagram.replace(/^@/, '').toLowerCase().trim();
    if (!clean) { setInstagramError('Pseudo Instagram requis'); return; }
    if (!/^[a-z0-9._]+$/.test(clean)) { setInstagramError('Pseudo invalide (lettres, chiffres, . et _ uniquement)'); return; }
    setInstagramError('');
    setCheckingInstagram(true);
    try {
      const res = await fetch('/api/status');
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
        body: JSON.stringify({ instagram, brazilScore, moroccoScore, scorers: selectedScorers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur lors de la soumission'); setLoading(false); return; }
      setSubmittedBet({ instagram, brazilScore, moroccoScore, scorers: selectedScorers });
      setSubmitted(true);
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const getResultLabel = (b: number, m: number) => {
    if (b > m) return 'Victoire Brésil 🇧🇷';
    if (m > b) return 'Victoire Maroc 🇲🇦';
    return 'Match nul ⚖️';
  };

  const brazilSelected = selectedScorers.filter((s) => BRAZIL_PLAYERS.some((p) => p.name === s)).length;
  const moroccoSelected = selectedScorers.filter((s) => MOROCCO_PLAYERS.some((p) => p.name === s)).length;

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
              Coupe du Monde 2026
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-0.5">
            PARI <span style={{ color: '#FFD700' }}>MEGARAMA</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">🇧🇷 Brésil — Maroc 🇲🇦</p>
        </div>
      </header>

      <main className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full pt-6">

        {/* Betting closed */}
        {!bettingOpen && !submitted && (
          <div className="animate-slide-up bg-[#111] border border-[#2a2a2a] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-white mb-2">Paris fermés</h2>
            <p className="text-gray-500 text-sm">Les paris sont actuellement fermés.<br />Revenez avant le coup d'envoi !</p>
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
                <h2 className="text-xl font-black text-white">Pari enregistré !</h2>
                <p className="text-gray-400 text-sm mt-1">Bonne chance @{submittedBet.instagram} 🎉</p>
              </div>

              <div className="bg-black rounded-xl p-4 mb-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-3">Ton pronostic</p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-1">🇧🇷</div>
                    <div className="text-4xl font-black text-white">{submittedBet.brazilScore}</div>
                    <div className="text-xs text-gray-600 mt-1">Brésil</div>
                  </div>
                  <div className="text-gray-700 text-2xl">—</div>
                  <div className="text-center">
                    <div className="text-3xl mb-1">🇲🇦</div>
                    <div className="text-4xl font-black text-white">{submittedBet.moroccoScore}</div>
                    <div className="text-xs text-gray-600 mt-1">Maroc</div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <span
                    className="text-xs rounded-full px-3 py-1 font-bold"
                    style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}
                  >
                    {getResultLabel(submittedBet.brazilScore, submittedBet.moroccoScore)}
                  </span>
                </div>
              </div>

              {submittedBet.scorers.length > 0 && (
                <div className="bg-black rounded-xl p-4">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-3">
                    Buteurs ({submittedBet.scorers.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {submittedBet.scorers.map((scorer) => (
                      <span
                        key={scorer}
                        className="text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg px-2.5 py-1.5 font-medium"
                      >
                        {scorer}
                      </span>
                    ))}
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
                  <h2 className="text-lg font-black text-white mb-1">Ton pseudo Instagram</h2>
                  <p className="text-gray-500 text-sm mb-5">Un seul pari par compte.</p>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-lg select-none" style={{ color: '#FFD700' }}>@</div>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => {
                        setInstagram(e.target.value.replace(/^@+/, ''));
                        if (instagramError) setInstagramError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStep1Next()}
                      placeholder="ton_pseudo"
                      autoComplete="off"
                      autoCapitalize="none"
                      className={`w-full bg-black border-2 rounded-xl px-4 py-4 pl-9 text-white text-lg font-semibold placeholder-gray-700 focus:outline-none transition-colors ${
                        instagramError ? 'border-red-500/50' : 'border-[#2a2a2a] focus:border-[#FFD700]/50'
                      }`}
                    />
                  </div>
                  {instagramError && (
                    <p className="text-red-400 text-sm mt-2">⚠ {instagramError}</p>
                  )}

                  <button
                    onClick={handleStep1Next}
                    disabled={checkingInstagram || !instagram.trim()}
                    className="w-full mt-5 font-black py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <p className="text-gray-500 text-sm mb-6">Quel sera le score final ?</p>

                  <div className="flex items-center justify-around py-2">
                    <ScoreInput label="Brésil" flag="🇧🇷" value={brazilScore} onChange={setBrazilScore} />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-3xl text-gray-600 font-thin">:</span>
                      <span className="text-[10px] text-gray-500 font-bold text-center mt-1" style={{ maxWidth: '64px' }}>
                        {brazilScore > moroccoScore ? '🇧🇷 Gagne' : moroccoScore > brazilScore ? '🇲🇦 Gagne' : 'Nul'}
                      </span>
                    </div>
                    <ScoreInput label="Maroc" flag="🇲🇦" value={moroccoScore} onChange={setMoroccoScore} />
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
                  <p className="text-gray-500 text-sm mb-4">
                    Sélectionne les joueurs qui vont marquer.{' '}
                    <span style={{ color: '#FFD700' }} className="font-bold">
                      {selectedScorers.length} choisi{selectedScorers.length > 1 ? 's' : ''}
                    </span>
                  </p>

                  {/* Score recap */}
                  <div className="bg-black rounded-xl px-4 py-2.5 mb-4 flex items-center justify-center gap-4 border border-[#1a1a1a]">
                    <span className="text-gray-400 text-sm font-bold">🇧🇷 {brazilScore}</span>
                    <span className="text-gray-700">—</span>
                    <span className="text-gray-400 text-sm font-bold">{moroccoScore} 🇲🇦</span>
                  </div>

                  {/* Team tabs */}
                  <div className="flex rounded-xl overflow-hidden border border-[#2a2a2a] mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveTeam('brazil')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTeam === 'brazil' ? 'text-black' : 'text-gray-500 bg-[#0a0a0a] hover:text-gray-300'
                      }`}
                      style={activeTeam === 'brazil' ? { background: '#FFD700' } : {}}
                    >
                      🇧🇷 Brésil
                      {brazilSelected > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                            activeTeam === 'brazil' ? 'bg-black/20 text-black' : 'bg-[#FFD700]/20 text-[#FFD700]'
                          }`}
                        >
                          {brazilSelected}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTeam('morocco')}
                      className={`flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTeam === 'morocco' ? 'text-black' : 'text-gray-500 bg-[#0a0a0a] hover:text-gray-300'
                      }`}
                      style={activeTeam === 'morocco' ? { background: '#FFD700' } : {}}
                    >
                      🇲🇦 Maroc
                      {moroccoSelected > 0 && (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                            activeTeam === 'morocco' ? 'bg-black/20 text-black' : 'bg-[#FFD700]/20 text-[#FFD700]'
                          }`}
                        >
                          {moroccoSelected}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Formation view */}
                  {activeTeam === 'brazil' && (
                    <PitchFormation
                      players={BRAZIL_PLAYERS}
                      selectedScorers={selectedScorers}
                      onToggle={toggleScorer}
                    />
                  )}
                  {activeTeam === 'morocco' && (
                    <PitchFormation
                      players={MOROCCO_PLAYERS}
                      selectedScorers={selectedScorers}
                      onToggle={toggleScorer}
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
                      '⚽ Valider mon pari'
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
