export interface Player {
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  team: 'brazil' | 'morocco';
}

export const BRAZIL_PLAYERS: Player[] = [
  // Goalkeepers
  { name: 'Alisson', position: 'GK', team: 'brazil' },
  { name: 'Ederson', position: 'GK', team: 'brazil' },
  { name: 'Bento', position: 'GK', team: 'brazil' },
  // Defenders
  { name: 'Danilo', position: 'DEF', team: 'brazil' },
  { name: 'Éder Militão', position: 'DEF', team: 'brazil' },
  { name: 'Marquinhos', position: 'DEF', team: 'brazil' },
  { name: 'Gabriel Magalhães', position: 'DEF', team: 'brazil' },
  { name: 'Wendell', position: 'DEF', team: 'brazil' },
  { name: 'Alex Telles', position: 'DEF', team: 'brazil' },
  { name: 'Guilherme Arana', position: 'DEF', team: 'brazil' },
  // Midfielders
  { name: 'Casemiro', position: 'MID', team: 'brazil' },
  { name: 'Bruno Guimarães', position: 'MID', team: 'brazil' },
  { name: 'Lucas Paquetá', position: 'MID', team: 'brazil' },
  { name: 'Gerson', position: 'MID', team: 'brazil' },
  { name: 'Andreas Pereira', position: 'MID', team: 'brazil' },
  { name: 'Joelinton', position: 'MID', team: 'brazil' },
  { name: 'Douglas Luiz', position: 'MID', team: 'brazil' },
  // Forwards
  { name: 'Vinicius Jr', position: 'FWD', team: 'brazil' },
  { name: 'Rodrygo', position: 'FWD', team: 'brazil' },
  { name: 'Raphinha', position: 'FWD', team: 'brazil' },
  { name: 'Gabriel Martinelli', position: 'FWD', team: 'brazil' },
  { name: 'Endrick', position: 'FWD', team: 'brazil' },
  { name: 'Savinho', position: 'FWD', team: 'brazil' },
  { name: 'Gabriel Jesus', position: 'FWD', team: 'brazil' },
  { name: 'Matheus Cunha', position: 'FWD', team: 'brazil' },
  { name: 'Richarlison', position: 'FWD', team: 'brazil' },
];

export const MOROCCO_PLAYERS: Player[] = [
  // Goalkeepers
  { name: 'Yassine Bounou (Bono)', position: 'GK', team: 'morocco' },
  { name: 'Munir Mohamedi', position: 'GK', team: 'morocco' },
  { name: 'Anas Zniti', position: 'GK', team: 'morocco' },
  // Defenders
  { name: 'Achraf Hakimi', position: 'DEF', team: 'morocco' },
  { name: 'Nayef Aguerd', position: 'DEF', team: 'morocco' },
  { name: 'Romain Saïss', position: 'DEF', team: 'morocco' },
  { name: 'Jawad El Yamiq', position: 'DEF', team: 'morocco' },
  { name: 'Noussair Mazraoui', position: 'DEF', team: 'morocco' },
  { name: 'Adam Masina', position: 'DEF', team: 'morocco' },
  { name: 'Badr Benoun', position: 'DEF', team: 'morocco' },
  // Midfielders
  { name: 'Sofyan Amrabat', position: 'MID', team: 'morocco' },
  { name: 'Azzedine Ounahi', position: 'MID', team: 'morocco' },
  { name: 'Selim Amallah', position: 'MID', team: 'morocco' },
  { name: 'Bilal El Khannouss', position: 'MID', team: 'morocco' },
  { name: 'Abdelhamid Sabiri', position: 'MID', team: 'morocco' },
  { name: 'Ilias Chair', position: 'MID', team: 'morocco' },
  { name: 'Reda Tagnaouti', position: 'MID', team: 'morocco' },
  // Forwards
  { name: 'Hakim Ziyech', position: 'FWD', team: 'morocco' },
  { name: 'Youssef En-Nesyri', position: 'FWD', team: 'morocco' },
  { name: 'Soufiane Boufal', position: 'FWD', team: 'morocco' },
  { name: 'Abde Ezzalzouli', position: 'FWD', team: 'morocco' },
  { name: 'Brahim Díaz', position: 'FWD', team: 'morocco' },
  { name: 'Ayoub El Kaabi', position: 'FWD', team: 'morocco' },
  { name: 'Zakaria Aboukhlal', position: 'FWD', team: 'morocco' },
  { name: 'Anass Zaroury', position: 'FWD', team: 'morocco' },
  { name: 'Ryan Mmaee', position: 'FWD', team: 'morocco' },
];

export const ALL_PLAYERS = [...BRAZIL_PLAYERS, ...MOROCCO_PLAYERS];

export const POSITION_LABELS: Record<Player['position'], string> = {
  GK: 'Gardien',
  DEF: 'Défenseur',
  MID: 'Milieu',
  FWD: 'Attaquant',
};
