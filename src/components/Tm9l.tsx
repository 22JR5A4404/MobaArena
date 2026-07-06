import Link from "next/link";
import { Team } from "@/types/t0";

const GAME_LABELS: Record<string, string> = {
  freefire: "Free Fire",
  pubg: "PUBG",
  cod: "Call of Duty",
};

const GAME_COLORS: Record<string, string> = {
  freefire: "border-primary text-primary",
  pubg: "border-accent text-accent",
  cod: "border-secondary text-secondary",
};

export default function TeamCard({ team }: { team: Team }) {
  const winRate = ((team.wins / (team.wins + team.losses)) * 100).toFixed(1);

  return (
    <Link href={`/teams/${team.id}`}>
      <div className="pixel-card p-0 cursor-pointer hover:border-primary transition-colors group">
        <div className="h-1" style={{ background: team.color }} />

        <div className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 border-[3px] border-border flex items-center justify-center shrink-0"
              style={{ background: `${team.color}20` }}
            >
              <span className="font-[family-name:var(--font-press-start)] text-[10px] font-bold" style={{ color: team.color }}>
                {team.tag}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-text group-hover:text-primary transition-colors truncate">
                  {team.name}
                </h3>
                <span className={`px-1.5 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${GAME_COLORS[team.game]}`}>
                  {GAME_LABELS[team.game]}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-3">{team.region} &middot; EST. {team.founded}</p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface-hover border border-border p-2 text-center">
                  <span className="text-[7px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">RECORD</span>
                  <span className="font-[family-name:var(--font-press-start)] text-[9px] text-text">{team.wins}W {team.losses}L</span>
                </div>
                <div className="bg-surface-hover border border-border p-2 text-center">
                  <span className="text-[7px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">WIN%</span>
                  <span className="font-[family-name:var(--font-press-start)] text-[9px] text-primary">{winRate}%</span>
                </div>
                <div className="bg-surface-hover border border-border p-2 text-center">
                  <span className="text-[7px] font-[family-name:var(--font-press-start)] text-text-muted block mb-1">MMR</span>
                  <span className="font-[family-name:var(--font-press-start)] text-[9px] text-secondary">{team.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
