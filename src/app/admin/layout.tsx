"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { logout } from "./actions";

const sidebarLinks = [
  { href: "/admin", label: "DASHBOARD", icon: "■" },
  { href: "/admin/tournaments", label: "TOURNAMENTS", icon: "◆" },
  { href: "/admin/teams", label: "TEAMS", icon: "▲" },
  { href: "/admin/players", label: "PLAYERS", icon: "●" },
  { href: "/admin/matches", label: "MATCHES", icon: "▶" },
  { href: "/admin/users", label: "USERS", icon: "♦" },
  { href: "/admin/registrations", label: "REGISTRATIONS", icon: "◊" },
  { href: "/admin/messages", label: "MESSAGES", icon: "✉" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-primary border-[3px] border-primary flex items-center justify-center"
        style={{ clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }}
      >
        <span className="font-[family-name:var(--font-press-start)] text-[10px] text-background">
          {sidebarOpen ? "X" : "="}
        </span>
      </button>

      <aside className={`
        fixed md:sticky top-0 md:top-16 left-0 z-40
        w-64 h-screen md:h-[calc(100vh-4rem)]
        bg-surface border-r-3 border-border
        transform transition-transform md:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        overflow-y-auto
      `}>
        <div className="p-4 border-b-3 border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/20 border-2 border-accent flex items-center justify-center">
              <span className="font-[family-name:var(--font-press-start)] text-[8px] text-accent">A</span>
            </div>
            <div>
              <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text">ADMIN PANEL</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 font-[family-name:var(--font-press-start)] text-[8px] transition-all ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary text-primary"
                    : "border-2 border-transparent text-text-muted hover:text-primary hover:border-border"
                }`}
              >
                <span className={isActive ? "text-primary" : "text-text-muted"}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t-3 border-border space-y-1">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 font-[family-name:var(--font-press-start)] text-[7px] text-danger hover:text-secondary transition-colors w-full"
          >
            LOGOUT
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 font-[family-name:var(--font-press-start)] text-[7px] text-text-muted hover:text-primary transition-colors"
          >
            &lt; BACK TO SITE
          </Link>
        </div>
      </aside>

      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {children}
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
