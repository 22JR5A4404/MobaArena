import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <pre className="font-[family-name:var(--font-press-start)] text-primary crt-glow-green text-xs sm:text-sm leading-tight retro-flicker">
{`
 ██████  ██████  ██████  ██████
██      ██    ██ ██  ██  ██  ██
██      ██    ██ ██  ██  ██  ██
██      ██    ██ ██  ██  ██  ██
 ██████  ██████  ██████  ██████
`}
          </pre>
        </div>

        <h1 className="font-[family-name:var(--font-press-start)] text-lg text-accent mb-4">GAME OVER</h1>
        <p className="font-[family-name:var(--font-vt323)] text-xl text-text-muted mb-8 max-w-md mx-auto">
          This page has been slain. The URL you seek has fallen in battle.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="retro-btn retro-btn-primary">
            RESPAWN HOME
          </Link>
          <Link href="/tournaments" className="retro-btn retro-btn-secondary">
            FIND MATCH
          </Link>
        </div>
      </div>
    </div>
  );
}
