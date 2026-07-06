"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getTeam, saveTeam } from "../../actions";

const GAME_OPTIONS = [
  { value: "freefire", label: "Free Fire" },
  { value: "pubg", label: "PUBG" },
  { value: "cod", label: "Call of Duty" },
];

const REGION_OPTIONS = ["KR", "NA", "EU", "CN", "SEA", "CIS", "BR", "JP"];

export default function EditTeamPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";

  const [form, setForm] = useState({
    name: "",
    tag: "",
    logo: "",
    game: "freefire",
    region: "NA",
    rating: 1500,
    wins: 0,
    losses: 0,
    founded: "2024",
    description: "",
    color: "#39ff14",
    captain: "",
    players: [] as string[],
  });
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    getTeam(params.id as string).then((t) => {
      if (t) {
        setForm({
          name: t.name,
          tag: t.tag,
          logo: t.logo || "",
          game: t.game,
          region: t.region,
          rating: t.rating,
          wins: t.wins,
          losses: t.losses,
          founded: t.founded,
          description: t.description,
          color: t.color,
          captain: t.captain,
          players: JSON.parse(t.players || "[]"),
        });
      }
      setLoaded(true);
    });
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveTeam({ id: params.id as string, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { if (isNew) router.push("/admin/teams"); }, 1500);
  };

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
          {isNew ? "NEW TEAM" : "EDIT TEAM"}
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
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TEAM NAME</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">TAG</label>
              <input type="text" required value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                maxLength={10} />
            </div>
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
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">REGION</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary">
                {REGION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">MMR</label>
              <input type="number" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 1500 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">WINS</label>
              <input type="number" value={form.wins} onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">LOSSES</label>
              <input type="number" value={form.losses} onChange={(e) => setForm({ ...form, losses: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">FOUNDED</label>
              <input type="text" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="2024" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">COLOR</label>
              <div className="flex gap-3">
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-12 h-12 border-[3px] border-border cursor-pointer" />
                <input type="text" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="flex-1 px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">CAPTAIN ID</label>
              <input type="text" value={form.captain} onChange={(e) => setForm({ ...form, captain: e.target.value })}
                className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary"
                placeholder="e.g. p1" />
            </div>
          </div>

          <div>
            <label className="block font-[family-name:var(--font-press-start)] text-[7px] text-text-muted mb-2">DESCRIPTION</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 border-[3px] border-border bg-surface text-text font-[family-name:var(--font-vt323)] text-lg focus:outline-none focus:border-primary resize-none" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="retro-btn retro-btn-primary">
              {saving ? "SAVING..." : "SAVE TEAM"}
            </button>
            <button type="button" onClick={() => router.back()} className="retro-btn retro-btn-secondary">CANCEL</button>
          </div>
        </form>
      )}
    </div>
  );
}
