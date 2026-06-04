'use client';

import { useState, useEffect, useCallback } from 'react';
import { BRAZIL_PLAYERS, MOROCCO_PLAYERS, POSITION_LABELS, Player } from '@/lib/players';

type Step = 1 | 2 | 3;

interface BetSummary {
  instagram: string;
  brazilScore: number;
  moroccoScore: number;
  scorers: string[];
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function StepIndicator({ current, total }: { current: Step; total: number }) {
  const steps = [
    { num: 1, label: 'Pseudo' },
    { num: 2, label: 'Score' },
    { num: 3, label: 'Buteurs' },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => (
        <div key={step.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                current > step.num
                  ? 'bg-green-500 text-white'
                  : current === step.num
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-[#1f1f1f] text-gray-500'
              }`}
            >
              {current > step.num ? <CheckIcon /> : step.num}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${
                current >= step.num ? 'text-green-400' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`h-0.5 w-12 mx-1 mb-4 transition-all duration-300 ${
                current > step.num + 0 ? 'bg-green-500' : 'bg-[#1f1f1f]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function PlayerCard({
  player,
  selected,
  onToggle,
}: {
  player: Player;
  selected: boolean;
  onToggle: (name: string) => void;
}) {
  const positionColors: Record<Player['position'], string> = {
    GK: 'text-yellow-400 bg-yellow-400/10',
    DEF: 'text-blue-400 bg-blue-400/10',
    MID: 'text-purple-400 bg-purple-400/10',
    FWD: 'text-red-400 bg-red-400/10',
  };

  return (
    <button
      type="button"
      onClick={() => onToggle(player.name)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left border ${
        selected
          ? 'bg-green-500/15 border-green-500/50 shadow-sm shadow-green-500/10'
          : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#222]'
      }`}
    >
      <div
        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${
          selected ? 'bg-green-500 border-green-500' : 'border-gray-600'
        }`}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm font-medium flex-1 ${selected ? 'text-white' : 'text-gray-300'}`}>
        {player.name}
      </span>
      <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${positionColors[player.position]}`}>
        {player.position}
      </span>
    </button>
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
      <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2f2f2f] text-white text-xl font-bold hover:bg-[#2a2a2a] hover:border-green-500/50 transition-all active:scale-95"
        >
          −
        </button>
        <div className="w-16 h-16 bg-[#111] border-2 border-green-500/40 rounded-2xl flex items-center justify-center">
          <span className="text-4xl font-black text-white">{value}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2f2f2f] text-white text-xl font-bold hover:bg-[#2a2a2a] hover:border-green-500/50 transition-all active:scale-95"
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

  const validateInstagram = (val: string) => {
    const clean = val.replace(/^@/, '').toLowerCase().trim();
    if (!clean) return 'Pseudo Instagram requis';
    if (clean.length < 1) return 'Pseudo trop court';
    if (!/^[a-z0-9._]+$/.test(clean)) return 'Pseudo invalide (lettres, chiffres, . et _ uniquement)';
    return '';
  };

  const handleStep1Next = async () => {
    const err = validateInstagram(instagram);
    if (err) {
      setInstagramError(err);
      return;
    }
    setInstagramError('');
    const clean = instagram.replace(/^@/, '').toLowerCase().trim();

    // Check if already bet
    setCheckingInstagram(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (!data.bettingOpen) {
        setBettingOpen(false);
        setCheckingInstagram(false);
        return;
      }
    } catch {
      // Continue anyway
    }
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
          instagram,
          brazilScore,
          moroccoScore,
          scorers: selectedScorers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la soumission');
        setLoading(false);
        return;
      }
      setSubmittedBet({ instagram, brazilScore, moroccoScore, scorers: selectedScorers });
      setSubmitted(true);
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const getResultLabel = () => {
    if (brazilScore > moroccoScore) return 'Victoire Brésil 🇧🇷';
    if (moroccoScore > brazilScore) return 'Victoire Maroc 🇲🇦';
    return 'Match nul';
  };

  // Loading state
  if (bettingOpen === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-transparent" />
        <div className="relative px-4 pt-10 pb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
              Coupe du Monde 2026
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            PARI <span className="text-green-400">MEGARAMA</span>
          </h1>
          <p className="text-gray-500 text-sm">
            🇧🇷 Brésil vs Maroc 🇲🇦
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 pb-10 max-w-lg mx-auto w-full">
        {/* Betting closed */}
        {!bettingOpen && !submitted && (
          <div className="animate-slide-up">
            <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h2 className="text-xl font-bold text-white mb-2">Paris fermés</h2>
              <p className="text-gray-400 text-sm">
                Les paris pour ce match sont actuellement fermés.
                <br />
                Revenez avant le coup d'envoi !
              </p>
            </div>
          </div>
        )}

        {/* Already submitted - confirmation */}
        {submitted && submittedBet && (
          <div className="animate-slide-up">
            <div className="bg-[#111] border border-green-500/30 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Pari enregistré !</h2>
                <p className="text-gray-400 text-sm mt-1">Bonne chance @{submittedBet.instagram} 🎉</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0a0a0a] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">Ton pronostic</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🇧🇷</div>
                      <div className="text-4xl font-black text-white">{submittedBet.brazilScore}</div>
                      <div className="text-xs text-gray-500 mt-1">Brésil</div>
                    </div>
                    <div className="text-gray-600 text-2xl font-light">—</div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">🇲🇦</div>
                      <div className="text-4xl font-black text-white">{submittedBet.moroccoScore}</div>
                      <div className="text-xs text-gray-500 mt-1">Maroc</div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1 font-semibold">
                      {getResultLabel()}
                    </span>
                  </div>
                </div>

                {submittedBet.scorers.length > 0 && (
                  <div className="bg-[#0a0a0a] rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-semibold">
                      Buteurs sélectionnés ({submittedBet.scorers.length})
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

                {submittedBet.scorers.length === 0 && (
                  <div className="bg-[#0a0a0a] rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500">Aucun buteur sélectionné</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-600">
                  Les résultats seront annoncés après le match
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Betting form */}
        {bettingOpen && !submitted && (
          <div className="animate-fade-in">
            <StepIndicator current={step} total={3} />

            {/* Step 1: Instagram */}
            {step === 1 && (
              <div className="animate-slide-up">
                <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-6">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-1">Ton pseudo Instagram</h2>
                    <p className="text-gray-500 text-sm">Un seul pari par compte. Assure-toi d'entrer le bon pseudo.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400 font-bold text-lg select-none">@</div>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^@+/, '');
                        setInstagram(val);
                        if (instagramError) setInstagramError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleStep1Next()}
                      placeholder="ton_pseudo"
                      autoComplete="off"
                      autoCapitalize="none"
                      className={`w-full bg-[#0a0a0a] border-2 rounded-xl px-4 py-4 pl-9 text-white text-lg font-medium placeholder-gray-700 focus:outline-none transition-colors ${
                        instagramError ? 'border-red-500/50 focus:border-red-500' : 'border-[#2a2a2a] focus:border-green-500/60'
                      }`}
                    />
                  </div>
                  {instagramError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                      <span>⚠</span> {instagramError}
                    </p>
                  )}

                  <button
                    onClick={handleStep1Next}
                    disabled={checkingInstagram || !instagram.trim()}
                    className="w-full mt-5 bg-green-500 hover:bg-green-400 disabled:bg-[#1f1f1f] disabled:text-gray-600 text-white font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] shadow-lg shadow-green-500/20 disabled:shadow-none"
                  >
                    {checkingInstagram ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-white mb-1">Pronostic du score</h2>
                    <p className="text-gray-500 text-sm">Quel sera le score final ?</p>
                  </div>

                  <div className="flex items-center justify-around py-4">
                    <ScoreInput
                      label="Brésil"
                      flag="🇧🇷"
                      value={brazilScore}
                      onChange={setBrazilScore}
                    />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl text-gray-600 font-thin">:</span>
                      <span className="text-xs text-gray-600 font-semibold mt-1">
                        {brazilScore > moroccoScore ? '🇧🇷 Gagne' : moroccoScore > brazilScore ? '🇲🇦 Gagne' : 'Match nul'}
                      </span>
                    </div>
                    <ScoreInput
                      label="Maroc"
                      flag="🇲🇦"
                      value={moroccoScore}
                      onChange={setMoroccoScore}
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-400 font-semibold py-4 rounded-xl transition-all text-sm"
                    >
                      ← Retour
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-[2] bg-green-500 hover:bg-green-400 text-white font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] shadow-lg shadow-green-500/20"
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
                <div className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-5">
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-white mb-1">Buteurs du match</h2>
                    <p className="text-gray-500 text-sm">
                      Sélectionne les joueurs qui selon toi vont marquer.{' '}
                      <span className="text-green-400 font-medium">{selectedScorers.length} sélectionné{selectedScorers.length > 1 ? 's' : ''}</span>
                    </p>
                  </div>

                  {/* Score recap */}
                  <div className="bg-[#0a0a0a] rounded-xl px-4 py-3 mb-5 flex items-center justify-center gap-4">
                    <span className="text-gray-400 text-sm font-medium">🇧🇷 {brazilScore}</span>
                    <span className="text-gray-600">—</span>
                    <span className="text-gray-400 text-sm font-medium">{moroccoScore} 🇲🇦</span>
                  </div>

                  {/* Brazil players */}
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🇧🇷</span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Brésil</h3>
                      <span className="text-xs text-gray-600">({selectedScorers.filter(s => BRAZIL_PLAYERS.some(p => p.name === s)).length} choisi{selectedScorers.filter(s => BRAZIL_PLAYERS.some(p => p.name === s)).length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="space-y-1.5">
                      {BRAZIL_PLAYERS.map((player) => (
                        <PlayerCard
                          key={player.name}
                          player={player}
                          selected={selectedScorers.includes(player.name)}
                          onToggle={toggleScorer}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Morocco players */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🇲🇦</span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Maroc</h3>
                      <span className="text-xs text-gray-600">({selectedScorers.filter(s => MOROCCO_PLAYERS.some(p => p.name === s)).length} choisi{selectedScorers.filter(s => MOROCCO_PLAYERS.some(p => p.name === s)).length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="space-y-1.5">
                      {MOROCCO_PLAYERS.map((player) => (
                        <PlayerCard
                          key={player.name}
                          player={player}
                          selected={selectedScorers.includes(player.name)}
                          onToggle={toggleScorer}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm font-medium text-center">{error}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-gray-400 font-semibold py-4 rounded-xl transition-all text-sm disabled:opacity-50"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-[2] bg-green-500 hover:bg-green-400 disabled:bg-green-800 text-white font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-[0.98] shadow-lg shadow-green-500/20 disabled:shadow-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

      {/* Footer */}
      <footer className="text-center py-6 px-4">
        <p className="text-gray-700 text-xs">Megarama © 2026 — Coupe du Monde</p>
      </footer>
    </div>
  );
}
