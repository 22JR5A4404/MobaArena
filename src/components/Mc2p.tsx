import { Match, MatchStatus } from "@/types/t0";
import teamsData from "@/data/teams.json";

const TEAM_MAP = Object.fromEntries(teamsData.map((t) => [t.id, t]));

const STATUS_CONFIG: Record<MatchStatus, { bg: string; label: string; live?: boolean }> = {
  scheduled: { bg: "bg-primary/20 text-primary border-primary", label: "SCHEDULED" },
  live: { bg: "bg-accent/20 text-accent border-accent", label: "LIVE", live: true },
  completed: { bg: "bg-text-muted/20 text-text-muted border-text-muted", label: "DONE" },
  cancelled: { bg: "bg-text-muted/20 text-text-muted border-text-muted", label: "CANCEL" },
};

export default function MatchCard({ match }: { match: Match }) {
  const t1 = TEAM_MAP[match.team1];
  const t2 = TEAM_MAP[match.team2];
  const status = STATUS_CONFIG[match.status];

  return (
    <div className="pixel-card p-0 hover:border-primary transition-colors">
      <div className={`px-4 py-2 border-b-3 border-border flex items-center justify-between`}>
        <span className="text-[7px] font-[family-name:var(--font-press-start)] text-text-muted truncate max-w-[60%]">
          {match.tournamentName}
        </span>
        <span className={`px-2 py-0.5 border text-[7px] font-[family-name:var(--font-press-start)] ${status.bg}`}>
          {status.live && <span className="inline-block w-1 h-1 bg-accent mr-1 retro-blink" />}
          {status.label}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto mb-2 bg-surface-hover border-[3px] border-border flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">{t1?.tag || "???"}</span>
            </div>
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text truncate">{t1?.name || match.team1}</p>
          </div>

          <div className="px-6 text-center">
            {match.status === "completed" || (match.status === "live" && match.team1Score !== null) ? (
              <div className="flex items-center gap-3">
                <span className="font-[family-name:var(--font-press-start)] text-2xl text-primary crt-glow-green">{match.team1Score}</span>
                <span className="font-[family-name:var(--font-press-start)] text-lg text-text-muted">:</span>
                <span className="font-[family-name:var(--font-press-start)] text-2xl text-accent">{match.team2Score}</span>
              </div>
            ) : (
              <span className="font-[family-name:var(--font-press-start)] text-lg text-text-muted">VS</span>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="w-14 h-14 mx-auto mb-2 bg-surface-hover border-[3px] border-border flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-[8px] text-secondary">{t2?.tag || "???"}</span>
            </div>
            <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text truncate">{t2?.name || match.team2}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-3 border-border flex items-center justify-between">
          <span className="text-xs text-text-muted">
            {new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} &middot; {match.time}
          </span>
          {match.streamUrl && (
            <a
              href={match.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[family-name:var(--font-press-start)] text-[7px] text-accent hover:text-primary"
            >
              WATCH LIVE &gt;&gt;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
