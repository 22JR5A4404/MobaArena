import Link from "next/link";

const GAME_LABELS: Record<string, string> = {
  freefire: "FREE FIRE",
  pubg: "PUBG",
  cod: "CALL OF DUTY",
};

interface HeroProps {
  liveGames?: string[];
}

export default function Hero({ liveGames = [] }: HeroProps) {
  const displayText = liveGames.length > 0
    ? liveGames.map((g) => GAME_LABELS[g] || g.toUpperCase()).join(" / ") + " — NOW LIVE"
    : "TOURNAMENTS — REGISTRATION OPEN";

  return (
    <section className="relative overflow-hidden bg-surface pixel-grid scanlines">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border-2 border-primary mb-8">
            <span className="w-2 h-2 bg-primary retro-blink" />
            <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">
              {displayText}
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-press-start)] text-2xl sm:text-3xl md:text-5xl text-primary crt-glow-green mb-6 retro-flicker leading-relaxed">
            MOBA
            <br />
            <span className="text-secondary crt-glow-orange">ARENA</span>
          </h1>

          <p className="font-[family-name:var(--font-vt323)] text-xl sm:text-2xl text-text-muted max-w-2xl mx-auto mb-10">
            The ultimate retro-styled tournament platform for Free Fire, PUBG, and Call of Duty.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tournaments"
              className="retro-btn retro-btn-primary"
            >
              BROWSE TOURNAMENTS &gt;&gt;
            </Link>
            <Link
              href="/leaderboards"
              className="retro-btn retro-btn-secondary"
            >
              VIEW RANKINGS
            </Link>
          </div>
        </div>

        <div className="absolute top-10 left-10 w-4 h-4 bg-primary opacity-20 hidden lg:block" />
        <div className="absolute top-20 right-20 w-3 h-3 bg-secondary opacity-20 hidden lg:block" />
        <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-accent opacity-20 hidden lg:block" />
        <div className="absolute bottom-20 right-1/3 w-4 h-4 bg-primary opacity-10 hidden lg:block" />
      </div>
    </section>
  );
}
