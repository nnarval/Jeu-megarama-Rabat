import Link from 'next/link';
import { MATCHES } from '@/lib/matches';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-[#1a1a1a]">
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,215,0,0.08) 0%, transparent 70%)' }}
        />
        <div className="relative px-4 pt-8 pb-6 text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 border"
            style={{ background: 'rgba(255,215,0,0.08)', borderColor: 'rgba(255,215,0,0.2)' }}
          >
            <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse" />
            <span className="text-[#FFD700] text-[10px] font-bold uppercase tracking-widest">
              Coupe du Monde 2026
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            Jeu <span style={{ color: '#FFD700' }}>Megarama</span>
          </h1>
          <p className="text-gray-500 text-sm">Choisissez votre match et faites votre pronostic</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="space-y-3">
          {MATCHES.map((match) => (
            <Link
              key={match.slug}
              href={`/${match.slug}`}
              className="block bg-[#111] border border-[#1f1f1f] rounded-2xl p-4 hover:border-[#FFD700]/30 hover:bg-[#141414] transition-all duration-200 active:scale-[0.99] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Teams */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base leading-none">{match.team1.flag}</span>
                    <span className="text-white font-bold text-sm">{match.team1.name}</span>
                    <span className="text-gray-600 text-xs font-bold">vs</span>
                    <span className="text-base leading-none">{match.team2.flag}</span>
                    <span className="text-white font-bold text-sm">{match.team2.name}</span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,215,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.2)' }}
                    >
                      {match.group}
                    </span>
                    <span className="text-gray-500 text-xs font-medium">
                      {match.date} · {match.time}
                    </span>
                    <span className="text-gray-600 text-xs">
                      📍 {match.city}
                    </span>
                  </div>
                </div>

                <div className="ml-3 flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-gray-600 group-hover:text-[#FFD700] transition-colors duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="text-center py-5 px-4 border-t border-[#0f0f0f]">
        <p className="text-gray-800 text-xs font-medium">Megarama © 2026 — Coupe du Monde</p>
      </footer>
    </div>
  );
}
