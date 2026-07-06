import { BracketData } from "@/types/t0";

interface TeamInfo {
  id: string;
  name: string;
  tag: string;
  color: string;
}

export default function BracketView({ bracket, teams }: { bracket: BracketData; teams: TeamInfo[] }) {
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {bracket.rounds.map((round, ri) => (
          <div key={ri} className="flex flex-col gap-4">
            <h4 className="font-[family-name:var(--font-press-start)] text-[8px] text-primary text-center mb-2 crt-glow-green">
              {round.name}
            </h4>
            <div className="flex flex-col gap-6" style={{ justifyContent: "space-around", flex: 1 }}>
              {round.matches.map((match, mi) => {
                const t1 = match.team1 ? teamMap[match.team1] : null;
                const t2 = match.team2 ? teamMap[match.team2] : null;
                const isWinner1 = match.winner === match.team1;
                const isWinner2 = match.winner === match.team2;

                return (
                  <div key={mi} className="relative">
                    {ri > 0 && (
                      <svg className="absolute top-0 left-[-32px] w-8 h-full pointer-events-none" preserveAspectRatio="none">
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="1" className="text-primary opacity-30" />
                        <line x1="0" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="1" className="text-primary opacity-30" />
                      </svg>
                    )}

                    <div className="bg-surface border-[3px] border-border w-64">
                      <div className={`flex items-center justify-between px-3 py-2 border-b-3 border-border ${
                        isWinner1 ? "bg-primary/10" : ""
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-[family-name:var(--font-press-start)] text-[7px] ${isWinner1 ? "text-primary" : "text-text-muted"}`}>
                            {t1?.tag || "TBD"}
                          </span>
                          <span className={`text-xs truncate ${isWinner1 ? "text-text font-bold" : "text-text-muted"}`}>
                            {t1?.name || "TBD"}
                          </span>
                        </div>
                        <span className={`font-[family-name:var(--font-press-start)] text-sm ml-2 ${
                          isWinner1 ? "text-primary crt-glow-green" : "text-text-muted"
                        }`}>
                          {match.score1 !== null ? match.score1 : "-"}
                        </span>
                      </div>

                      <div className={`flex items-center justify-between px-3 py-2 ${
                        isWinner2 ? "bg-primary/10" : ""
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-[family-name:var(--font-press-start)] text-[7px] ${isWinner2 ? "text-primary" : "text-text-muted"}`}>
                            {t2?.tag || "TBD"}
                          </span>
                          <span className={`text-xs truncate ${isWinner2 ? "text-text font-bold" : "text-text-muted"}`}>
                            {t2?.name || "TBD"}
                          </span>
                        </div>
                        <span className={`font-[family-name:var(--font-press-start)] text-sm ml-2 ${
                          isWinner2 ? "text-primary crt-glow-green" : "text-text-muted"
                        }`}>
                          {match.score2 !== null ? match.score2 : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
