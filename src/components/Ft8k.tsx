import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface border-t-3 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary flex items-center justify-center" style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }}>
                <span className="font-[family-name:var(--font-press-start)] text-[6px] font-bold text-background">MA</span>
              </div>
              <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">
                MOBA<span className="text-secondary">ARENA</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted">
              Retro-styled tournament platform for MOBA enthusiasts. Compete. Win. Repeat.
            </p>
          </div>

          {[
            { title: "Tournaments", links: [{ label: "All Tournaments", href: "/tournaments" }] },
            { title: "Games", links: [{ label: "Free Fire", href: "/tournaments?game=freefire" }, { label: "PUBG", href: "/tournaments?game=pubg" }, { label: "Call of Duty", href: "/tournaments?game=cod" }] },
            { title: "Community", links: [{ label: "Leaderboards", href: "/leaderboards" }, { label: "Teams", href: "/teams" }, { label: "Players", href: "/players" }] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-[family-name:var(--font-press-start)] text-[8px] text-primary mb-4">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t-3 border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted">
            &copy; 2026 MOBA ARENA. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-4">
            <span className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hover:text-primary cursor-pointer">
              PRIVACY
            </span>
            <span className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hover:text-primary cursor-pointer">
              TERMS
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
