export type Game = "freefire" | "pubg" | "cod";

export type TournamentFormat = "single-elimination" | "double-elimination" | "round-robin";

export type TournamentStatus = "upcoming" | "registration" | "ongoing" | "completed";

export type MatchStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  game: Game;
  region: string;
  rating: number;
  wins: number;
  losses: number;
  players: string[];
  captain: string;
  founded: string;
  description: string;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  realName: string;
  role: string;
  game: Game;
  teamId: string | null;
  rating: number;
  champion?: string;
  stats: {
    kda?: number;
    cs?: number;
    visionScore?: number;
    damagePerGame?: number;
    winRate?: number;
    gamesPlayed?: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  game: Game;
  format: TournamentFormat;
  status: TournamentStatus;
  prizePool: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxTeams: number;
  registeredTeams: number;
  organizer: string;
  description: string;
  rules: string[];
  bracket?: BracketData;
}

export interface BracketData {
  rounds: BracketRound[];
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

export interface BracketMatch {
  team1: string | null;
  team2: string | null;
  score1: number | null;
  score2: number | null;
  winner: string | null;
}

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName: string;
  game: Game;
  team1: string;
  team2: string;
  team1Score: number | null;
  team2Score: number | null;
  status: MatchStatus;
  date: string;
  time: string;
  streamUrl?: string;
  patch?: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamTag: string;
  game: Game;
  rating: number;
  wins: number;
  losses: number;
  winRate: number;
  streak: string;
}
