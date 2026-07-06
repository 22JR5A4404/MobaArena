"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "./Tp3j";
import { getCurrentUser } from "@/app/user/actions";
import { isAuthenticated } from "@/app/admin/actions";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/tournaments", label: "TOURNAMENTS" },
  { href: "/teams", label: "TEAMS" },
  { href: "/players", label: "PLAYERS" },
  { href: "/matches", label: "MATCHES" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => setUser(u));
    isAuthenticated().then((a) => setAdmin(a));
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-sm border-b-3 border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center" style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }}>
              <span className="font-[family-name:var(--font-press-start)] text-[8px] font-bold text-background">MA</span>
            </div>
            <span className="font-[family-name:var(--font-press-start)] text-[10px] sm:text-xs text-primary crt-glow-green hidden sm:block">
              MOBA<span className="text-secondary">ARENA</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 border-2 border-primary bg-transparent relative cursor-pointer flex items-center justify-center overflow-hidden"
              aria-label="Toggle theme"
            >
              <span className={`absolute transition-all duration-300 ${
                theme === "light" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
              }`}>
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              <span className={`absolute transition-all duration-300 ${
                theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"
              }`}>
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
            </button>

            {admin ? (
              <Link href="/admin" className="hidden md:flex items-center gap-2 px-3 py-1.5 border-2 border-accent bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="w-6 h-6 bg-accent/30 border border-accent flex items-center justify-center">
                  <span className="font-[family-name:var(--font-press-start)] text-[7px] text-accent">A</span>
                </div>
                <span className="font-[family-name:var(--font-press-start)] text-[7px] text-accent">ADMIN</span>
              </Link>
            ) : user ? (
              <Link href="/user" className="hidden md:flex items-center gap-2 px-3 py-1.5 border-2 border-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                <div className="w-6 h-6 bg-primary/30 border border-primary flex items-center justify-center">
                  <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="font-[family-name:var(--font-press-start)] text-[7px] text-primary">{user.name.toUpperCase()}</span>
              </Link>
            ) : (
              <Link href="/user/login" className="hidden md:block font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary transition-colors">
                LOGIN
              </Link>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-3 text-text-muted hover:text-primary"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open ? (
                  <path strokeLinecap="square" strokeWidth={2} d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path strokeLinecap="square" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t-3 border-border bg-surface">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-3 font-[family-name:var(--font-press-start)] text-[9px] text-text-muted hover:text-primary hover:bg-surface-hover transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t-2 border-border mt-2 pt-2">
              {admin ? (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 font-[family-name:var(--font-press-start)] text-[9px] text-accent hover:bg-surface-hover transition-colors"
                >
                  ADMIN PORTAL
                </Link>
              ) : user ? (
                <Link
                  href="/user"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 font-[family-name:var(--font-press-start)] text-[9px] text-primary hover:bg-surface-hover transition-colors"
                >
                  PLAYER: {user.name.toUpperCase()}
                </Link>
              ) : (
                <Link
                  href="/user/login"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 font-[family-name:var(--font-press-start)] text-[9px] text-primary hover:bg-surface-hover transition-colors"
                >
                  LOGIN / REGISTER
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
