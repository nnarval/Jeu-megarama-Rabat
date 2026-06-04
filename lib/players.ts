export interface Player {
  name: string;
  shortName: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  team: 'brazil' | 'morocco';
  starter: boolean;
}

export const BRAZIL_PLAYERS: Player[] = [
  // === TITULAIRES (4-3-3) ===
  { name: 'Alisson', shortName: 'Alisson', position: 'GK', team: 'brazil', starter: true },
  { name: 'Danilo', shortName: 'Danilo', position: 'DEF', team: 'brazil', starter: true },
  { name: 'Éder Militão', shortName: 'Militão', position: 'DEF', team: 'brazil', starter: true },
  { name: 'Marquinhos', shortName: 'Marquinhos', position: 'DEF', team: 'brazil', starter: true },
  { name: 'Guilherme Arana', shortName: 'Arana', position: 'DEF', team: 'brazil', starter: true },
  { name: 'Casemiro', shortName: 'Casemiro', position: 'MID', team: 'brazil', starter: true },
  { name: 'Bruno Guimarães', shortName: 'Guimarães', position: 'MID', team: 'brazil', starter: true },
  { name: 'Lucas Paquetá', shortName: 'Paquetá', position: 'MID', team: 'brazil', starter: true },
  { name: 'Raphinha', shortName: 'Raphinha', position: 'FWD', team: 'brazil', starter: true },
  { name: 'Vinicius Jr', shortName: 'Vinicius Jr', position: 'FWD', team: 'brazil', starter: true },
  { name: 'Rodrygo', shortName: 'Rodrygo', position: 'FWD', team: 'brazil', starter: true },
  // === REMPLAÇANTS ===
  { name: 'Ederson', shortName: 'Ederson', position: 'GK', team: 'brazil', starter: false },
  { name: 'Bento', shortName: 'Bento', position: 'GK', team: 'brazil', starter: false },
  { name: 'Gabriel Magalhães', shortName: 'G. Magalhães', position: 'DEF', team: 'brazil', starter: false },
  { name: 'Wendell', shortName: 'Wendell', position: 'DEF', team: 'brazil', starter: false },
  { name: 'Alex Telles', shortName: 'Telles', position: 'DEF', team: 'brazil', starter: false },
  { name: 'Gerson', shortName: 'Gerson', position: 'MID', team: 'brazil', starter: false },
  { name: 'Andreas Pereira', shortName: 'A. Pereira', position: 'MID', team: 'brazil', starter: false },
  { name: 'Joelinton', shortName: 'Joelinton', position: 'MID', team: 'brazil', starter: false },
  { name: 'Douglas Luiz', shortName: 'D. Luiz', position: 'MID', team: 'brazil', starter: false },
  { name: 'Gabriel Martinelli', shortName: 'Martinelli', position: 'FWD', team: 'brazil', starter: false },
  { name: 'Endrick', shortName: 'Endrick', position: 'FWD', team: 'brazil', starter: false },
  { name: 'Savinho', shortName: 'Savinho', position: 'FWD', team: 'brazil', starter: false },
  { name: 'Gabriel Jesus', shortName: 'G. Jesus', position: 'FWD', team: 'brazil', starter: false },
  { name: 'Matheus Cunha', shortName: 'M. Cunha', position: 'FWD', team: 'brazil', starter: false },
  { name: 'Richarlison', shortName: 'Richarlison', position: 'FWD', team: 'brazil', starter: false },
];

export const MOROCCO_PLAYERS: Player[] = [
  // === TITULAIRES (4-3-3) ===
  { name: 'Yassine Bounou', shortName: 'Bono', position: 'GK', team: 'morocco', starter: true },
  { name: 'Achraf Hakimi', shortName: 'Hakimi', position: 'DEF', team: 'morocco', starter: true },
  { name: 'Nayef Aguerd', shortName: 'Aguerd', position: 'DEF', team: 'morocco', starter: true },
  { name: 'Romain Saïss', shortName: 'Saïss', position: 'DEF', team: 'morocco', starter: true },
  { name: 'Noussair Mazraoui', shortName: 'Mazraoui', position: 'DEF', team: 'morocco', starter: true },
  { name: 'Sofyan Amrabat', shortName: 'Amrabat', position: 'MID', team: 'morocco', starter: true },
  { name: 'Azzedine Ounahi', shortName: 'Ounahi', position: 'MID', team: 'morocco', starter: true },
  { name: 'Bilal El Khannouss', shortName: 'El Khannouss', position: 'MID', team: 'morocco', starter: true },
  { name: 'Hakim Ziyech', shortName: 'Ziyech', position: 'FWD', team: 'morocco', starter: true },
  { name: 'Youssef En-Nesyri', shortName: 'En-Nesyri', position: 'FWD', team: 'morocco', starter: true },
  { name: 'Soufiane Boufal', shortName: 'Boufal', position: 'FWD', team: 'morocco', starter: true },
  // === REMPLAÇANTS ===
  { name: 'Munir Mohamedi', shortName: 'Mohamedi', position: 'GK', team: 'morocco', starter: false },
  { name: 'Anas Zniti', shortName: 'Zniti', position: 'GK', team: 'morocco', starter: false },
  { name: 'Jawad El Yamiq', shortName: 'El Yamiq', position: 'DEF', team: 'morocco', starter: false },
  { name: 'Adam Masina', shortName: 'Masina', position: 'DEF', team: 'morocco', starter: false },
  { name: 'Badr Benoun', shortName: 'Benoun', position: 'DEF', team: 'morocco', starter: false },
  { name: 'Selim Amallah', shortName: 'Amallah', position: 'MID', team: 'morocco', starter: false },
  { name: 'Abdelhamid Sabiri', shortName: 'Sabiri', position: 'MID', team: 'morocco', starter: false },
  { name: 'Ilias Chair', shortName: 'I. Chair', position: 'MID', team: 'morocco', starter: false },
  { name: 'Abde Ezzalzouli', shortName: 'Abde', position: 'FWD', team: 'morocco', starter: false },
  { name: 'Brahim Díaz', shortName: 'B. Díaz', position: 'FWD', team: 'morocco', starter: false },
  { name: 'Ayoub El Kaabi', shortName: 'El Kaabi', position: 'FWD', team: 'morocco', starter: false },
  { name: 'Zakaria Aboukhlal', shortName: 'Aboukhlal', position: 'FWD', team: 'morocco', starter: false },
  { name: 'Anass Zaroury', shortName: 'Zaroury', position: 'FWD', team: 'morocco', starter: false },
  { name: 'Ryan Mmaee', shortName: 'Mmaee', position: 'FWD', team: 'morocco', starter: false },
];

export const ALL_PLAYERS = [...BRAZIL_PLAYERS, ...MOROCCO_PLAYERS];

export const POSITION_LABELS: Record<Player['position'], string> = {
  GK: 'Gardien',
  DEF: 'Défenseur',
  MID: 'Milieu',
  FWD: 'Attaquant',
};
