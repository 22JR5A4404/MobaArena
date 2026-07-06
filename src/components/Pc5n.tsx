import Link from "next/link";
import { Player } from "@/types/t0";

const GAME_COLORS: Record<string, string> = {
  freefire: "border-primary text-primary",
  pubg: "border-secondary text-secondary",
  cod: "border-accent text-accent",
};

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <Link href={`/players/${player.id}`}>
      <div className="pixel-card p-0 cursor-pointer hover:border-primary transition-colors group">
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-surface-hover border-[3px] border-border flex items-center justify-center shrink-0">
              <span className="font-[family-name:var(--font-press-start)] text-lg text-primary group-hover:crt-glow-green transition-all">
                {player.name[0]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-text group-hover:text-primary transition-colors truncate">
                  {player.name}
                </h3>
                <span className={`px-1.5 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${GAME_COLORS[player.game]}`}>
                  {player.game.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-text-muted mb-1">{player.role}</p>
              {player.champion && (
                <p className="text-xs text-secondary">Main: {player.champion}</p>
              )}
            </div>

            <div className="text-right shrink-0">
              <div className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">{player.rating}</div>
              <div className="text-[7px] font-[family-name:var(--font-press-start)] text-text-muted">MMR</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
