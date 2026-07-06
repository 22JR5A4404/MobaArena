"use client";

import { use, useState, useEffect } from "react";
import { getPublicTournament, getPublicTeams, getPublicTournamentRegistrations } from "../../actions";
import { getCurrentUser, registerForTournament, cancelRegistration, getTournamentRegistrations } from "@/app/user/actions";
import BracketView from "@/components/Bv1q";
import Link from "next/link";
import { BracketData } from "@/types/t0";

const GAME_LABELS: Record<string, string> = {
  freefire: "FREE FIRE",
  pubg: "PUBG",
  cod: "CALL OF DUTY",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "border-text-muted text-text-muted",
  registration: "border-primary text-primary",
  ongoing: "border-accent text-accent",
  completed: "border-secondary text-secondary",
};

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tournament, setTournament] = useState<{ id: string; name: string; game: string; format: string; status: string; prizePool: string; entryFee: string; whatsapp: string; startDate: string; endDate: string; registrationDeadline: string; maxTeams: number; registeredTeams: number; organizer: string; description: string; rules: string[]; bracket: BracketData | Record<string, never> } | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string; tag: string; color: string }[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; game: string } | null>(null);
  const [registrations, setRegistrations] = useState<{ id: string; userId: string; playerName: string; playerEmail: string; teamName: string; teamTag: string; teamColor: string; status: string }[]>([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regMsg, setRegMsg] = useState("");
  const [regErr, setRegErr] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamTag, setTeamTag] = useState("");
  const [showRegForm, setShowRegForm] = useState(false);

  useEffect(() => {
    Promise.all([
      getPublicTournament(id),
      getPublicTeams(),
      getCurrentUser(),
      getPublicTournamentRegistrations(id),
    ]).then(([t, tm, u, regs]) => {
      if (t) {
        setTournament({
          ...t,
          rules: JSON.parse(t.rules || "[]"),
          bracket: JSON.parse(t.bracket || "{}"),
        });
      } else {
        setNotFound(true);
      }
      if (tm) setTeams(tm.map((team) => ({ id: team.id, name: team.name, tag: team.tag, color: team.color })));
      if (u) setUser(u);
      setRegistrations(regs);
    }).catch(() => setNotFound(true));
  }, [id]);

  const myReg = user ? registrations.find((r) => r.userId === user.id) : null;

  async function handleRegister() {
    if (!user) return;
    setRegLoading(true);
    setRegMsg("");
    setRegErr("");
    const result = await registerForTournament({
      tournamentId: id,
      teamName,
      teamTag,
      gameName: user.game,
    });
    if (result.success) {
      setShowRegForm(false);
      setRegMsg("Registration submitted! Contact the organizer on WhatsApp to complete your entry.");
      const regs = await getTournamentRegistrations(id).catch(() => []);
      setRegistrations(regs);
      if (result.whatsapp) {
        setTournament((t) => t ? { ...t, whatsapp: result.whatsapp } : t);
      }
    } else {
      setRegErr(result.error || "Registration failed");
    }
    setRegLoading(false);
  }

  async function handleCancel() {
    if (!myReg) return;
    setRegLoading(true);
    setRegMsg("");
    setRegErr("");
    const result = await cancelRegistration(myReg.id);
    if (result.success) {
      setRegMsg("Registration cancelled");
      setRegistrations(registrations.filter((r) => r.id !== myReg.id));
    } else {
      setRegErr(result.error || "Failed to cancel");
    }
    setRegLoading(false);
  }

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="font-[family-name:var(--font-press-start)] text-sm text-text-muted">TOURNAMENT NOT FOUND</p>
        <Link href="/tournaments" className="mt-4 inline-block font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary">
          &lt; BACK TO TOURNAMENTS
        </Link>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6 font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">
        <Link href="/tournaments" className="hover:text-primary">TOURNAMENTS</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{tournament.name}</span>
      </div>

      <div className="mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] border-primary text-primary">
            {GAME_LABELS[tournament.game]}
          </span>
          <span className={`px-2 py-0.5 border text-[8px] font-[family-name:var(--font-press-start)] uppercase ${STATUS_COLORS[tournament.status]}`}>
            {tournament.status === "ongoing" && <span className="inline-block w-1.5 h-1.5 bg-accent mr-1 retro-blink" />}
            {tournament.status}
          </span>
        </div>
        <h1 className="font-[family-name:var(--font-press-start)] text-lg sm:text-xl text-primary crt-glow-green mb-4 leading-relaxed">{tournament.name}</h1>
        <p className="font-[family-name:var(--font-vt323)] text-xl text-text-muted max-w-3xl">{tournament.description}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: "PRIZE POOL", value: tournament.prizePool, color: "text-primary" },
          { label: "ENTRY FEE", value: tournament.entryFee, color: tournament.entryFee === "Free" ? "text-success" : "text-primary" },
          { label: "FORMAT", value: tournament.format.replace(/-/g, " "), color: "text-text" },
          { label: "TEAMS", value: `${tournament.registeredTeams}/${tournament.maxTeams}`, color: "text-text" },
          { label: "DATES", value: `${new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(tournament.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, color: "text-text" },
        ].map((item) => (
          <div key={item.label} className="pixel-card p-4">
            <p className="font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">{item.label}</p>
            <p className={`font-[family-name:var(--font-press-start)] text-[11px] ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {tournament.status === "registration" && (
        <div className="mb-10 pixel-card p-6 border-primary">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">TOURNAMENT REGISTRATION</h3>
          <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-2">
            {tournament.registeredTeams}/{tournament.maxTeams} slots filled &bull; Deadline:{" "}
            {new Date(tournament.registrationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
          <p className="font-[family-name:var(--font-vt323)] text-sm mb-4">
            Entry Fee: <span className={`font-[family-name:var(--font-press-start)] text-[9px] ${tournament.entryFee === "Free" ? "text-success" : "text-primary"}`}>{tournament.entryFee}</span>
          </p>

          {regMsg && (
            <div className="bg-success/10 border-2 border-success p-3 mb-4 font-[family-name:var(--font-vt323)] text-sm text-success">{regMsg}</div>
          )}
          {regErr && (
            <div className="bg-danger/10 border-2 border-danger p-3 mb-4 font-[family-name:var(--font-vt323)] text-sm text-danger">{regErr}</div>
          )}

          {!user ? (
            <Link href="/user/login" className="retro-btn retro-btn-primary inline-block">
              LOGIN TO REGISTER
            </Link>
          ) : myReg ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-3 border-2 ${
                myReg.status === "confirmed" ? "bg-success/10 border-success" :
                myReg.status === "pending" ? "bg-warning/10 border-warning" :
                "bg-danger/10 border-danger"
              }`}>
                {myReg.teamTag && (
                  <div className="w-8 h-8 border-2 border-border flex items-center justify-center" style={{ background: `${myReg.teamColor}20` }}>
                    <span className="font-[family-name:var(--font-press-start)] text-[6px]" style={{ color: myReg.teamColor }}>{myReg.teamTag}</span>
                  </div>
                )}
                <div>
                  <p className={`font-[family-name:var(--font-press-start)] text-[8px] ${
                    myReg.status === "confirmed" ? "text-success" :
                    myReg.status === "pending" ? "text-warning" :
                    "text-danger"
                  }`}>
                    {myReg.status === "confirmed" ? "APPROVED" :
                     myReg.status === "pending" ? "PENDING - CONTACT ORGANIZER" :
                     "REJECTED"}
                  </p>
                  <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted">{myReg.teamName || user.name}</p>
                </div>
              </div>

              {myReg.status === "pending" && tournament.entryFee !== "Free" && tournament.whatsapp && (
                <div className="bg-primary/10 border-2 border-primary p-4">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-primary mb-2">PAYMENT INSTRUCTIONS</p>
                  <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-3">
                    Contact the tournament organizer to pay the entry fee of <span className="font-[family-name:var(--font-press-start)] text-[9px] text-primary">{tournament.entryFee}</span>. Your registration will be approved after payment confirmation.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${tournament.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I registered for ${tournament.name}. My entry is pending.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retro-btn retro-btn-primary inline-flex items-center gap-2"
                    >
                      <span>WHATSAPP</span>
                      <span className="font-[family-name:var(--font-press-start)] text-[10px]">↗</span>
                    </a>
                    <a
                      href={`tel:${tournament.whatsapp}`}
                      className="retro-btn retro-btn-secondary inline-flex items-center gap-2"
                    >
                      <span>CALL</span>
                    </a>
                  </div>
                  <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mt-2">
                    Contact: {tournament.whatsapp}
                  </p>
                </div>
              )}

              {myReg.status === "pending" && tournament.entryFee === "Free" && tournament.whatsapp && (
                <div className="bg-primary/10 border-2 border-primary p-4">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-primary mb-2">NEXT STEPS</p>
                  <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted mb-3">
                    Contact the tournament organizer to confirm your free entry.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/${tournament.whatsapp.replace(/[^0-9]/g, "")}?text=Hi, I registered for ${tournament.name}. My entry is pending.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retro-btn retro-btn-primary inline-flex items-center gap-2"
                    >
                      <span>WHATSAPP</span>
                      <span className="font-[family-name:var(--font-press-start)] text-[10px]">↗</span>
                    </a>
                    <a
                      href={`tel:${tournament.whatsapp}`}
                      className="retro-btn retro-btn-secondary inline-flex items-center gap-2"
                    >
                      <span>CALL</span>
                    </a>
                  </div>
                  <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted mt-2">
                    Contact: {tournament.whatsapp}
                  </p>
                </div>
              )}

              {myReg.status === "pending" && !tournament.whatsapp && (
                <p className="font-[family-name:var(--font-vt323)] text-sm text-text-muted">
                  Your registration is pending. The organizer will confirm your entry soon.
                </p>
              )}

              <button onClick={handleCancel} disabled={regLoading} className="retro-btn retro-btn-danger text-[7px]">
                {regLoading ? "..." : "CANCEL REGISTRATION"}
              </button>
            </div>
          ) : showRegForm ? (
            <div className="space-y-3">
              {tournament.entryFee !== "Free" && (
                <div className="bg-warning/10 border-2 border-warning p-3 font-[family-name:var(--font-vt323)] text-sm text-warning">
                  Entry fee of <span className="font-[family-name:var(--font-press-start)] text-[9px]">{tournament.entryFee}</span> is required. After registering, contact the organizer on WhatsApp to complete your entry.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">TEAM NAME</label>
                  <input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-1">TEAM TAG</label>
                  <input
                    value={teamTag}
                    onChange={(e) => setTeamTag(e.target.value)}
                    className="w-full bg-surface-hover border-2 border-border px-3 py-3 font-[family-name:var(--font-vt323)] text-text focus:border-primary focus:outline-none min-h-[44px]"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleRegister} disabled={regLoading} className="retro-btn retro-btn-primary">
                  {regLoading ? "SUBMITTING..." : "CONFIRM REGISTRATION"}
                </button>
                <button onClick={() => setShowRegForm(false)} className="retro-btn retro-btn-secondary">
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowRegForm(true)} className="retro-btn retro-btn-primary">
              REGISTER NOW
            </button>
          )}
        </div>
      )}

      {registrations.filter((r) => r.status === "confirmed").length > 0 && (
        <div className="mb-10">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">REGISTERED ({registrations.filter((r) => r.status === "confirmed").length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {registrations.filter((r) => r.status === "confirmed").map((reg) => (
              <div key={reg.id} className="flex items-center gap-3 pixel-card p-3">
                {reg.teamTag ? (
                  <div className="w-8 h-8 border-2 border-border flex items-center justify-center" style={{ background: `${reg.teamColor}20` }}>
                    <span className="font-[family-name:var(--font-press-start)] text-[6px]" style={{ color: reg.teamColor }}>{reg.teamTag}</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-primary/20 border-2 border-primary flex items-center justify-center">
                    <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">{reg.playerName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text truncate">{reg.teamName || reg.playerName}</p>
                  <p className="font-[family-name:var(--font-vt323)] text-xs text-text-muted truncate">{reg.playerName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tournament.rules.length > 0 && (
        <div className="mb-10">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-4">RULES</h3>
          <div className="pixel-card p-5">
            <ul className="space-y-3">
              {tournament.rules.map((rule: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-text-muted">
                  <span className="font-[family-name:var(--font-press-start)] text-[8px] text-primary">[{i + 1}]</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {tournament.bracket && tournament.bracket.rounds && (
        <div className="mb-10">
          <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary mb-6">TOURNAMENT BRACKET</h3>
          <div className="pixel-card p-6 overflow-hidden">
            <BracketView bracket={tournament.bracket as BracketData} teams={teams} />
          </div>
        </div>
      )}

    </div>
  );
}
