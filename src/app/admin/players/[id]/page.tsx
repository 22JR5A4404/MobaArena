"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlayer, savePlayer, getTeams } from "../../actions";

const GAME_OPTIONS = [
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const ROLE_OPTIONS = ["Mid Laner", "ADC", "Top Laner", "Jungler", "Support", "Carry", "Offlaner", "Flex"];

export default function EditPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "",
    realName: "",
    role: "Mid Laner",
    game: "freefire",
    teamId: null as string | null,
    rating: 1500,
    champion: "",
    stats: {
      kda: 0,
      cs: 0,
      visionScore: 0,
      damagePerGame: 0,
      winRate: 0,
      gamesPlayed: 0,
    },
  });
  const [allTeams, setAllTeams] = useState<Array<{ id: string; name: string; game: string }>>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getTeams().then((teams) => {
      setAllTeams(teams);

      if (isNew) {
        setLoaded(true);
        return;
      }

      getPlayer(params.id as string).then((p) => {
        if (p) {
          setForm({
            name: p.name,
            realName: p.realName,
            role: p.role,
            game: p.game,
            teamId: p.teamId,
            rating: p.rating,
            champion: p.champion || "",
            stats: JSON.parse(p.stats || "{}"),
          });
        }
        setLoaded(true);
      });
    });
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await savePlayer({ id: params.id as string, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { if (isNew) router.push("/admin/players"); }, 1500);
  };

  const gameTeams = allTeams.filter((t) => t.game === form.game);

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
          {isNew ? "NEW PLAYER" : "EDIT PLAYER"}
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
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">PLAYER NAME</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">REAL NAME</label>
              <input type="text" required value={form.realName} onChange={(e) => setForm({ ...form, realName: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">GAME</label>
              <select value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value, teamId: null })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                {GAME_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">ROLE</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">MMR</label>
              <input type="number" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 1500 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM</label>
              <select value={form.teamId || ""} onChange={(e) => setForm({ ...form, teamId: e.target.value || null })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                <option value="">No team</option>
                {gameTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">SIGNATURE CHAMPION</label>
              <input type="text" value={form.champion} onChange={(e) => setForm({ ...form, champion: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="e.g. Azir" />
            </div>
          </div>

          <div>
            <h3 className="font-[family-name:var(--font-press-start)] text-[8px] text-secondary mb-4">STATS</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { key: "kda", label: "KDA" },
                { key: "cs", label: "CS/MIN" },
                { key: "visionScore", label: "VISION" },
                { key: "damagePerGame", label: "DMG/GAME" },
                { key: "winRate", label: "WIN RATE %" },
                { key: "gamesPlayed", label: "GAMES" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block font-[family-name:var(--font-press-start)] text-[6px] text-text-muted mb-1">{label}</label>
                  <input type="number" step="any"
                    value={(form.stats as Record<string, number>)[key] || 0}
                    onChange={(e) => setForm({
                      ...form,
                      stats: { ...form.stats, [key]: parseFloat(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "SAVING..." : "SAVE PLAYER"}
            </button>
            <button type="button" onClick={() => router.back()} className="retro-btn retro-btn-secondary">CANCEL</button>
          </div>
        </form>
      )}
    </div>
  );
}
