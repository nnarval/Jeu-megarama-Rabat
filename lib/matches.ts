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
    slug: 'belgique-egypte',
    team1: { name: 'Belgique', flag: '🇧🇪', squadKey: 'belgique' },
    team2: { name: 'Égypte', flag: '🇪🇬', squadKey: 'egypte' },
    date: 'Lun 15 Juin',
    time: '20:00',
    group: 'Gr. G',
    city: 'Seattle',
  },
  {
    slug: 'france-senegal',
    team1: { name: 'France', flag: '🇫🇷', squadKey: 'france' },
    team2: { name: 'Sénégal', flag: '🇸🇳', squadKey: 'senegal' },
    date: 'Mar 16 Juin',
    time: '20:00',
    group: 'Gr. I',
    city: 'New York',
  },
  {
    slug: 'portugal-rd-congo',
    team1: { name: 'Portugal', flag: '🇵🇹', squadKey: 'portugal' },
    team2: { name: 'RD Congo', flag: '🇨🇩', squadKey: 'rd-congo' },
    date: 'Mer 17 Juin',
    time: '18:00',
    group: 'Gr. K',
    city: 'Houston',
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
    slug: 'allemagne-cote-ivoire',
    team1: { name: 'Allemagne', flag: '🇩🇪', squadKey: 'allemagne' },
    team2: { name: "Côte d'Ivoire", flag: '🇨🇮', squadKey: 'cote-ivoire' },
    date: 'Sam 20 Juin',
    time: '21:00',
    group: 'Gr. E',
    city: 'Toronto',
  },
  {
    slug: 'espagne-arabie-saoudite',
    team1: { name: 'Espagne', flag: '🇪🇸', squadKey: 'espagne' },
    team2: { name: 'Arabie Saoudite', flag: '🇸🇦', squadKey: 'arabie-saoudite' },
    date: 'Dim 21 Juin',
    time: '17:00',
    group: 'Gr. H',
    city: 'Atlanta',
  },
  {
    slug: 'france-irak',
    team1: { name: 'France', flag: '🇫🇷', squadKey: 'france' },
    team2: { name: 'Irak', flag: '🇮🇶', squadKey: 'irak' },
    date: 'Lun 22 Juin',
    time: '22:00',
    group: 'Gr. I',
    city: 'Philadelphie',
  },
  {
    slug: 'angleterre-ghana',
    team1: { name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', squadKey: 'angleterre' },
    team2: { name: 'Ghana', flag: '🇬🇭', squadKey: 'ghana' },
    date: 'Mar 23 Juin',
    time: '21:00',
    group: 'Gr. L',
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
    slug: 'norvege-france',
    team1: { name: 'Norvège', flag: '🇳🇴', squadKey: 'norvege' },
    team2: { name: 'France', flag: '🇫🇷', squadKey: 'france' },
    date: 'Ven 26 Juin',
    time: '20:00',
    group: 'Gr. I',
    city: 'Boston',
  },
];

export function getMatch(slug: string): MatchInfo | undefined {
  return MATCHES.find((m) => m.slug === slug);
}
