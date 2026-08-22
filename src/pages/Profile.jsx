import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Trash2, Heart, Calendar, Award, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import Celestial from "@/components/Celestial";
import EmptyState from "@/components/EmptyState";
import ThemeToggle from "@/components/ThemeToggle";
import { computeStats, computeStreak } from "@/lib/spiritual";

export default function Profile() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [salahLogs, setSalahLogs] = useState([]);
  const [dhikrLogs, setDhikrLogs] = useState([]);
  const [quranLogs, setQuranLogs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.UserSettings.list(),
      base44.entities.SalahLog.list("-date", 1000),
      base44.entities.DhikrLog.list("-date", 1000),
      base44.entities.QuranLog.list("-date", 1000),
      base44.entities.Quote.list(),
    ]).then(([s, sl, dl, ql, qs]) => {
      setSettings(s[0]);
      setSalahLogs(sl); setDhikrLogs(dl); setQuranLogs(ql); setQuotes(qs);
      setName(s[0]?.display_name || "");
    });
  }, []);

  const stats = useMemo(() => computeStats(salahLogs, dhikrLogs, quranLogs), [salahLogs, dhikrLogs, quranLogs]);
  const streak = useMemo(() => computeStreak(salahLogs), [salahLogs]);
  const savedQuotes = useMemo(() => {
    const favs = settings?.favorite_quotes || [];
    return quotes.filter((q) => favs.includes(q.id));
  }, [quotes, settings]);

  const saveName = async () => {
    setSavingName(true);
    try {
      await base44.entities.UserSettings.update(settings.id, { display_name: name.trim() });
      setSettings({ ...settings, display_name: name.trim() });
    } finally { setSavingName(false); }
  };

  const removeFavorite = async (id) => {
    const next = (settings.favorite_quotes || []).filter((x) => x !== id);
    await base44.entities.UserSettings.update(settings.id, { favorite_quotes: next });
    setSettings({ ...settings, favorite_quotes: next });
  };

  const deleteAllData = async () => {
    await Promise.all([
      base44.entities.SalahLog.deleteMany({}),
      base44.entities.DhikrLog.deleteMany({}),
      base44.entities.QuranLog.deleteMany({}),
      base44.entities.Reflection.deleteMany({}),
    ]);
    if (settings) await base44.entities.UserSettings.delete(settings.id);
    base44.auth.logout();
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-secondary">Profile</h1>
        <Celestial size={28} />
      </div>

      {/* Identity */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary text-xl font-semibold text-primary-foreground">
            {(settings.display_name || "Y").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{settings.display_name || "Your name"}</p>
            <p className="text-xs text-muted-foreground">{settings.focus || "No focus set"}</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <Label className="text-xs text-muted-foreground">Display name</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
            <Button onClick={saveName} disabled={savingName} variant="secondary" className="rounded-xl">Save</Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <Stat label="Current streak" value={`${streak.current}d`} />
        <Stat label="Longest streak" value={`${streak.longest}d`} />
        <Stat label="Salah logged" value={stats.totalPrayed} />
        <Stat label="Dhikr total" value={stats.totalDhikr} />
        <Stat label="Quran pages" value={stats.quranPages} />
        <Stat label="Complete tasbeeh" value={stats.completeTasbeehs} />
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <LinkCard icon={Calendar} title="History" onClick={() => navigate("/history")} />
        <LinkCard icon={Award} title="Collection" onClick={() => navigate("/collection")} />
      </div>

      {/* Appearance */}
      <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div>
          <p className="font-semibold text-foreground">Appearance</p>
          <p className="text-xs text-muted-foreground">Switch between day and night</p>
        </div>
        <ThemeToggle />
      </section>

      {/* Saved reminders */}
      <section>
        <h2 className="mb-3 font-semibold text-foreground">Saved Reminders</h2>
        {savedQuotes.length === 0 ? (
          <EmptyState icon={Heart} title="No saved reminders yet" subtitle="Tap the heart on a quote to keep it close." />
        ) : (
          <div className="space-y-2">
            {savedQuotes.map((q) => (
              <div key={q.id} className="rounded-xl border border-border bg-card p-3">
                <p className="font-display text-sm text-secondary">“{q.text}”</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">{q.source}</p>
                  <button onClick={() => removeFavorite(q.id)} className="text-primary" aria-label="Remove">
                    <Heart className="h-4 w-4 fill-primary" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border border-border bg-muted/30 p-4 flex gap-3">
        <ShieldCheck className="h-5 w-5 text-secondary shrink-0" />
        <p className="text-xs text-muted-foreground">
          Your spiritual activity is private by default. Only you can see your logs. No public leaderboards.
        </p>
      </section>

      {/* Account */}
      <section className="space-y-2">
        <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => base44.auth.logout()}>
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </Button>
        <Button variant="ghost" className="w-full rounded-xl justify-start text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete my data
        </Button>
      </section>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete all your data?</DialogTitle>
            <DialogDescription>
              This permanently removes every salah, dhikr and Quran log, your collection progress and settings. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} className="rounded-xl">Cancel</Button>
            <Button variant="destructive" onClick={deleteAllData} className="rounded-xl">Delete forever</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}

function LinkCard({ icon: Icon, title, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/30">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-secondary"><Icon className="h-5 w-5" /></span>
      <span className="font-medium text-foreground">{title}</span>
    </button>
  );
}