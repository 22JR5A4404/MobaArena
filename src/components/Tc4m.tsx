import Link from "next/link";
import { Tournament, TournamentStatus } from "@/types/t0";

const GAME_LABELS: Record<string, string> = {
  freefire: "FREE FIRE",
  pubg: "PUBG",
  cod: "CALL OF DUTY",
};

const GAME_COLORS: Record<string, string> = {
  freefire: "bg-primary/20 text-primary border-primary",
  pubg: "bg-accent/20 text-accent border-accent",
  cod: "bg-secondary/20 text-secondary border-secondary",
};

const STATUS_STYLES: Record<TournamentStatus, { bg: string; text: string }> = {
  upcoming: { bg: "bg-text-muted/20 text-text-muted border-text-muted", text: "UPCOMING" },
  registration: { bg: "bg-primary/20 text-primary border-primary", text: "OPEN" },
  ongoing: { bg: "bg-accent/20 text-accent border-accent", text: "LIVE" },
  completed: { bg: "bg-secondary/20 text-secondary border-secondary", text: "DONE" },
};

const FORMAT_LABELS: Record<string, string> = {
  "single-elimination": "SINGLE ELIM",
  "double-elimination": "DOUBLE ELIM",
  "round-robin": "ROUND ROBIN",
};

export default function TournamentCard({ tournament }: { tournament: Tournament }) {
  const status = STATUS_STYLES[tournament.status];

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <div className="pixel-card p-0 cursor-pointer hover:border-primary transition-colors group">
        <div className={`h-1.5 w-full ${
          tournament.game === "freefire" ? "bg-primary" :
          tournament.game === "pubg" ? "bg-accent" :
          "bg-secondary"
        }`} />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] ${GAME_COLORS[tournament.game]}`}>
              {GAME_LABELS[tournament.game]}
            </span>
            <span className={`px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] ${status.bg}`}>
              {tournament.status === "ongoing" && <span className="inline-block w-1.5 h-1.5 bg-accent mr-1 retro-blink" />}
              {status.text}
            </span>
          </div>

          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-text mb-3 leading-relaxed group-hover:text-primary transition-colors">
            {tournament.name}
          </h3>
          <p className="text-sm text-text-muted mb-4 line-clamp-2">{tournament.description}</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-hover p-2 border border-border">
              <span className="text-[8px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">PRIZE</span>
              <span className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">{tournament.prizePool}</span>
            </div>
            <div className="bg-surface-hover p-2 border border-border">
              <span className="text-[8px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">FORMAT</span>
              <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text">{FORMAT_LABELS[tournament.format]}</span>
            </div>
            <div className="bg-surface-hover p-2 border border-border">
              <span className="text-[8px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">TEAMS</span>
              <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text">{tournament.registeredTeams}/{tournament.maxTeams}</span>
            </div>
            <div className="bg-surface-hover p-2 border border-border">
              <span className="text-[8px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">START</span>
              <span className="font-[family-name:var(--font-press-start)] text-[10px] text-text">
                {new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-surface-hover border-t-3 border-border flex items-center justify-between">
          <span className="text-[8px] font-[family-name:var(--font-press-start)] text-text-muted">{tournament.organizer}</span>
          <span className="text-[8px] font-[family-name:var(--font-press-start)] text-primary group-hover:text-accent transition-colors">
            ENTER &gt;&gt;
          </span>
        </div>
      </div>
    </Link>
  );
}
