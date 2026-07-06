"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getMatches, saveMatch, getTeams, getTournaments } from "../../actions";

const GAME_OPTIONS = [
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "live", label: "Live" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function EditMatchPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    tournamentId: "",
    tournamentName: "",
    game: "freefire",
    team1: "",
    team2: "",
    team1Score: 0,
    team2Score: 0,
    status: "scheduled",
    date: "",
    time: "",
    streamUrl: "",
    patch: "",
  });
  const [allTeams, setAllTeams] = useState<Array<{ id: string; name: string; game: string }>>([]);
  const [allTournaments, setAllTournaments] = useState<Array<{ id: string; name: string; game: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([getTeams(), getTournaments()]).then(([teams, tourns]) => {
      setAllTeams(teams);
      setAllTournaments(tourns);

      if (isNew) {
        setLoaded(true);
        return;
      }

      getMatches().then((matches) => {
        const m = matches.find((match) => match.id === params.id);
        if (m) {
          setForm({
            tournamentId: m.tournamentId,
            tournamentName: m.tournamentName,
            game: m.game,
            team1: m.team1,
            team2: m.team2,
            team1Score: m.team1Score ?? 0,
            team2Score: m.team2Score ?? 0,
            status: m.status,
            date: m.date,
            time: m.time,
            streamUrl: m.streamUrl || "",
            patch: m.patch || "",
          });
        }
        setLoaded(true);
      });
    });
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tournament = allTournaments.find((t) => t.id === form.tournamentId);
    setSaving(true);
    await saveMatch({ id: params.id as string, ...form, tournamentName: tournament?.name || form.tournamentName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { if (isNew) router.push("/admin/matches"); }, 1500);
  };

  const gameTeams = allTeams.filter((t) => t.game === form.game);
  const gameTournaments = allTournaments.filter((t) => t.game === form.game);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="font-[family-name:var(--font-press-start)] text-[8px] text-text-muted animate-pulse">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-2">
          {isNew ? "NEW MATCH" : "EDIT MATCH"}
        </h1>
      </div>

      {saved ? (
        <div className="pixel-card p-8 text-center border-primary">
          <p className="font-[family-name:var(--font-press-start)] text-sm text-primary crt-glow-green mb-3">SAVED!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pixel-card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">GAME</label>
              <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value, team1: "", team2: "", tournamentId: "" })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                {GAME_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TOURNAMENT</label>
              <select value={form.tournamentId} onChange={(e) => setForm({ ...form, tournamentId: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                <option value="">Select tournament</option>
                {gameTournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM 1</label>
              <select value={form.team1} onChange={(e) => setForm({ ...form, team1: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                <option value="">Select team</option>
                {gameTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM 2</label>
              <select value={form.team2} onChange={(e) => setForm({ ...form, team2: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                <option value="">Select team</option>
                {gameTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM 1 SCORE</label>
              <input type="number" value={form.team1Score} onChange={(e) => setForm({ ...form, team1Score: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM 2 SCORE</label>
              <input type="number" value={form.team2Score} onChange={(e) => setForm({ ...form, team2Score: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">STATUS</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">DATE</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TIME</label>
              <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="18:00 UTC" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">PATCH</label>
              <input type="text" value={form.patch} onChange={(e) => setForm({ ...form, patch: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="14.18" />
            </div>
          </div>

          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">STREAM URL</label>
            <input type="url" value={form.streamUrl} onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
              className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
              placeholder="https://twitch.tv/..." />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "SAVING..." : "SAVE MATCH"}
            </button>
            <button type="button" onClick={() => router.back()} className="retro-btn retro-btn-secondary">CANCEL</button>
          </div>
        </form>
      )}
    </div>
  );
}
