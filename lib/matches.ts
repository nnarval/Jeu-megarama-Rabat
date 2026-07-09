export interface TeamInfo {
  name: string;
  flag: string;
  squadKey: string;
}

export interface MatchInfo {
  slug: string;
  team1: TeamInfo;
  team2: TeamInfo;
  date: string;
  time: string;
  group: string;
  city: string;
}

export const MATCHES: MatchInfo[] = [
  {
    slug: 'bresil-maroc',
    team1: { name: 'Brésil', flag: '🇧🇷', squadKey: 'bresil' },
    team2: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    date: 'Sam 13 Juin',
    time: '23:00',
    group: 'Gr. C',
    city: 'New York',
  },
  {
    slug: 'ecosse-maroc',
    team1: { name: 'Écosse', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', squadKey: 'ecosse' },
    team2: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    date: 'Ven 19 Juin',
    time: '23:00',
    group: 'Gr. C',
    city: 'Boston',
  },
  {
    slug: 'maroc-haiti',
    team1: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    team2: { name: 'Haïti', flag: '🇭🇹', squadKey: 'haiti' },
    date: 'Mer 24 Juin',
    time: '23:00',
    group: 'Gr. C',
    city: 'Atlanta',
  },
  {
    slug: 'maroc-paysbas',
    team1: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    team2: { name: 'Pays-Bas', flag: '🇳🇱', squadKey: 'paysbas' },
    date: 'Lun 30 Juin',
    time: '02:00',
    group: '1/16 de finale',
    city: 'Monterrey',
  },
  {
    slug: 'maroc-canada',
    team1: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    team2: { name: 'Canada', flag: '🇨🇦', squadKey: 'canada' },
    date: 'Sam 4 Juillet',
    time: '18:00',
    group: '1/8 de finale',
    city: 'Houston',
  },
  {
    slug: 'france-maroc',
    team1: { name: 'France', flag: '🇫🇷', squadKey: 'france' },
    team2: { name: 'Maroc', flag: '🇲🇦', squadKey: 'maroc' },
    date: 'Jeu 9 Juillet',
    time: '21:00',
    group: '1/4 de finale',
    city: 'Boston',
  },
];

export function getMatch(slug: string): MatchInfo | undefined {
  return MATCHES.find((m) => m.slug === slug);
}
