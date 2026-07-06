"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTournament, saveTournament, getTeams } from "../../actions";

const GAME_OPTIONS = [
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const FORMAT_OPTIONS = [
  { value: "single-elimination", label: "Single Elimination" },
  { value: "double-elimination", label: "Double Elimination" },
  { value: "round-robin", label: "Round Robin" },
];

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "registration", label: "Registration" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

interface BracketMatch {
  team1: string | null;
  team2: string | null;
  score1: number | null;
  score2: number | null;
  winner: string | null;
}

interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface TeamOption {
  id: string;
  name: string;
  tag: string;
  game: string;
}

export default function EditTournamentPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "",
    game: "freefire",
    format: "single-elimination",
    status: "upcoming",
    prizePool: "",
    entryFee: "Free",
    whatsapp: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    maxTeams: 16,
    organizer: "",
    description: "",
  });
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [bracket, setBracket] = useState<BracketRound[]>([]);
  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getTeams().then((t) => {
      setTeams(t.map((tm) => ({ id: tm.id, name: tm.name, tag: tm.tag, game: tm.game })));
    });
    if (isNew) return;
    getTournament(params.id as string).then((t) => {
      if (t) {
        setForm({
          name: t.name,
          game: t.game,
          format: t.format,
          status: t.status,
          prizePool: t.prizePool,
          entryFee: t.entryFee || "Free",
          whatsapp: t.whatsapp || "",
          startDate: t.startDate,
          endDate: t.endDate,
          registrationDeadline: t.registrationDeadline,
          maxTeams: t.maxTeams,
          organizer: t.organizer,
          description: t.description,
        });
        setRules(JSON.parse(t.rules || "[]"));
        setBracket(JSON.parse(t.bracket || '{"rounds":[]}').rounds || []);
      }
      setLoaded(true);
    });
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveTournament({
      id: params.id as string,
      ...form,
      rules,
      bracket: JSON.stringify({ rounds: bracket }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => {
      if (isNew) router.push("/admin/tournaments");
    }, 1500);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };
  const removeRule = (i: number) => setRules(rules.filter((_, idx) => idx !== i));
  const moveRule = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rules.length) return;
    const next = [...rules];
    [next[i], next[j]] = [next[j], next[i]];
    setRules(next);
  };

  const addRound = () => {
    setBracket([...bracket, { name: `Round ${bracket.length + 1}`, matches: [{ team1: null, team2: null, score1: null, score2: null, winner: null }] }]);
  };
  const removeRound = (ri: number) => setBracket(bracket.filter((_, i) => i !== ri));
  const updateRoundName = (ri: number, name: string) => {
    const next = [...bracket];
    next[ri] = { ...next[ri], name };
    setBracket(next);
  };
  const addMatch = (ri: number) => {
    const next = [...bracket];
    next[ri].matches.push({ team1: null, team2: null, score1: null, score2: null, winner: null });
    setBracket(next);
  };
  const removeMatch = (ri: number, mi: number) => {
    const next = [...bracket];
    next[ri].matches = next[ri].matches.filter((_, i) => i !== mi);
    setBracket(next);
  };
  const updateMatch = (ri: number, mi: number, field: keyof BracketMatch, value: string | number | null) => {
    const next = [...bracket];
    next[ri].matches[mi] = { ...next[ri].matches[mi], [field]: value };
    setBracket(next);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  const filteredTeams = teams.filter((t) => t.game === form.game);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
          {isNew ? "NEW TOURNAMENT" : "EDIT TOURNAMENT"}
        </h1>
      </div>

      {saved ? (
        <div className="pixel-card p-8 text-center border-primary">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-3">SAVED!</p>
          <p className="font-[family-name:var(--font-vt323)] text-lg text-text-muted">Tournament data updated successfully.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="pixel-card p-6 space-y-6">
            <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">BASIC INFO</h3>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TOURNAMENT NAME</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">GAME</label>
                <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                  {GAME_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">FORMAT</label>
                <select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                  {FORMAT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">STATUS</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">PRIZE POOL</label>
                <input type="text" value={form.prizePool} onChange={(e) => setForm({ ...form, prizePool: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                  placeholder="$50,000" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">ENTRY FEE</label>
                <input type="text" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                  placeholder="Free or $25" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">CONTACT NUMBER</label>
                <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                  placeholder="+1234567890" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">MAX TEAMS</label>
                <input type="number" value={form.maxTeams} onChange={(e) => setForm({ ...form, maxTeams: parseInt(e.target.value) || 16 })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">ORGANIZER</label>
                <input type="text" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">START DATE</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">END DATE</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">REG DEADLINE</label>
                <input type="date" value={form.registrationDeadline} onChange={(e) => setForm({ ...form, registrationDeadline: e.target.value })}
                  className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">DESCRIPTION</label>
              <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary resize-none" />
            </div>
          </div>

          <div className="pixel-card p-6 space-y-4">
            <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">RULES</h3>
            <div className="flex gap-2">
              <input type="text" value={newRule} onChange={(e) => setNewRule(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                className="flex-1 px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="Add a rule..." />
              <button type="button" onClick={addRule} className="retro-btn retro-btn-primary">ADD</button>
            </div>
            {rules.length === 0 && (
              <p className="text-text-muted font-[family-name:var(--font-vt323)] text-sm">No rules added yet.</p>
            )}
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 bg-surface-hover border-2 border-border px-3 py-2">
                  <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted shrink-0">{i + 1}.</span>
                  <span className="flex-1 font-[family-name:var(--font-vt323)] text-text text-sm">{rule}</span>
                  <button type="button" onClick={() => moveRule(i, -1)} disabled={i === 0}
                    className="text-text-muted hover:text-primary disabled:opacity-30 px-1">&uarr;</button>
                  <button type="button" onClick={() => moveRule(i, 1)} disabled={i === rules.length - 1}
                    className="text-text-muted hover:text-primary disabled:opacity-30 px-1">&darr;</button>
                  <button type="button" onClick={() => removeRule(i)}
                    className="text-danger hover:text-red-400 px-1 font-bold">&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div className="pixel-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-[family-name:var(--font-press-start)] text-[10px] text-primary">BRACKET</h3>
              <button type="button" onClick={addRound} className="retro-btn retro-btn-secondary text-[8px]">+ ADD ROUND</button>
            </div>
            {bracket.length === 0 && (
              <p className="text-text-muted font-[family-name:var(--font-vt323)] text-sm">No rounds added yet. Add rounds to build the bracket.</p>
            )}
            <div className="space-y-4">
              {bracket.map((round, ri) => (
                <div key={ri} className="border-2 border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="text" value={round.name} onChange={(e) => updateRoundName(ri, e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm focus:outline-none focus:border-primary" />
                    <button type="button" onClick={() => addMatch(ri)}
                      className="font-[family-name:var(--font-press-start)] text-[8px] text-primary hover:text-secondary">+ MATCH</button>
                    <button type="button" onClick={() => removeRound(ri)}
                      className="font-[family-name:var(--font-press-start)] text-[8px] text-danger hover:text-red-400">DELETE</button>
                  </div>
                  <div className="space-y-2">
                    {round.matches.map((match, mi) => (
                      <div key={mi} className="flex flex-wrap items-center gap-2 bg-surface-hover border-2 border-border p-3">
                        <select value={match.team1 || ""} onChange={(e) => updateMatch(ri, mi, "team1", e.target.value || null)}
                          className="px-2 py-2 border-2 border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm focus:outline-none focus:border-primary min-w-[120px]">
                          <option value="">TBD</option>
                          {filteredTeams.map((t) => <option key={t.id} value={t.id}>{t.tag} - {t.name}</option>)}
                        </select>
                        <input type="number" min={0} value={match.score1 ?? ""} onChange={(e) => updateMatch(ri, mi, "score1", e.target.value ? parseInt(e.target.value) : null)}
                          className="w-14 px-2 py-2 border-2 border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm text-center focus:outline-none focus:border-primary"
                          placeholder="-" />
                        <span className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted">VS</span>
                        <input type="number" min={0} value={match.score2 ?? ""} onChange={(e) => updateMatch(ri, mi, "score2", e.target.value ? parseInt(e.target.value) : null)}
                          className="w-14 px-2 py-2 border-2 border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm text-center focus:outline-none focus:border-primary"
                          placeholder="-" />
                        <select value={match.winner || ""} onChange={(e) => updateMatch(ri, mi, "winner", e.target.value || null)}
                          className="px-2 py-2 border-2 border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm focus:outline-none focus:border-primary min-w-[100px]">
                          <option value="">WINNER</option>
                          {match.team1 && <option value={match.team1}>{filteredTeams.find((t) => t.id === match.team1)?.tag || "Team 1"}</option>}
                          {match.team2 && <option value={match.team2}>{filteredTeams.find((t) => t.id === match.team2)?.tag || "Team 2"}</option>}
                        </select>
                        <button type="button" onClick={() => removeMatch(ri, mi)}
                          className="text-danger hover:text-red-400 font-bold px-1 ml-auto">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "SAVING..." : "SAVE TOURNAMENT"}
            </button>
            <button type="button" onClick={() => router.back()} className="retro-btn retro-btn-secondary">
              CANCEL
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
