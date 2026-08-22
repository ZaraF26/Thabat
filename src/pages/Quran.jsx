import { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, startOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import Celestial from "@/components/Celestial";
import { SURAHS } from "@/lib/constants";
import {
  todayStr, sumQuranPages, sumQuranVerses, uniqueSurahs, quranStreak,
} from "@/lib/spiritual";
import { cn } from "@/lib/utils";

export default function Quran() {
  const today = todayStr();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [surah, setSurah] = useState("");
  const [customSurah, setCustomSurah] = useState("");
  const [pages, setPages] = useState(0);
  const [verses, setVerses] = useState(0);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.QuranLog.list("-date", 500).then((rows) => {
      setLogs(rows);
      setLoading(false);
    });
  }, []);

  const todayLogs = useMemo(() => logs.filter((l) => l.date === today), [logs, today]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const todayPages = sumQuranPages(todayLogs);
    const weekPages = sumQuranPages(logs.filter((l) => isWithinInterval(parseISO(l.date), { start: weekStart, end: now })));
    const monthPages = sumQuranPages(logs.filter((l) => isWithinInterval(parseISO(l.date), { start: monthStart, end: now })));
    return {
      todayPages,
      weekPages,
      monthPages,
      totalPages: sumQuranPages(logs),
      totalVerses: sumQuranVerses(logs),
      surahsRead: uniqueSurahs(logs),
      streak: quranStreak(logs),
    };
  }, [logs, todayLogs, today]);

  const add = async () => {
    const surahName = surah === "__custom" ? customSurah.trim() : surah;
    if (pages <= 0 && verses <= 0 && !surahName) return;
    setSaving(true);
    try {
      const created = await base44.entities.QuranLog.create({
        date: today,
        surah_name: surahName || "",
        pages: Number(pages) || 0,
        verses: Number(verses) || 0,
        reflection: reflection.trim(),
      });
      setLogs((prev) => [created, ...prev]);
      setSurah(""); setCustomSurah(""); setPages(0); setVerses(0); setReflection("");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.QuranLog.delete(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-secondary">Quran</h1>
          <p className="text-xs text-muted-foreground">And We have made the Quran easy for remembrance.</p>
        </div>
        <Celestial size={28} />
      </div>

      {/* Log form */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Surah</Label>
          <Select value={surah} onValueChange={setSurah}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select surah (optional)" /></SelectTrigger>
            <SelectContent className="max-h-72">
              <SelectItem value="__custom">Custom…</SelectItem>
              {SURAHS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {surah === "__custom" && (
            <Input placeholder="Surah name" value={customSurah} onChange={(e) => setCustomSurah(e.target.value)} className="rounded-xl" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Pages</Label>
            <Input type="number" min="0" value={pages || ""} onChange={(e) => setPages(Math.max(0, Number(e.target.value)))} placeholder="0" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Verses</Label>
            <Input type="number" min="0" value={verses || ""} onChange={(e) => setVerses(Math.max(0, Number(e.target.value)))} placeholder="0" className="rounded-xl" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Reflection (optional)</Label>
          <Textarea rows={2} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="What touched you?" className="resize-none rounded-xl" />
        </div>

        <Button onClick={add} disabled={saving} className="w-full rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> Log reading
        </Button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={`${stats.todayPages}p`} />
        <StatCard label="This week" value={`${stats.weekPages}p`} />
        <StatCard label="This month" value={`${stats.monthPages}p`} />
        <StatCard label="Total pages" value={`${stats.totalPages}p`} />
        <StatCard label="Total verses" value={stats.totalVerses} />
        <StatCard label="Surahs read" value={stats.surahsRead} />
        <StatCard label="Reading streak" value={`${stats.streak}d`} />
      </section>

      {/* Today's entries */}
      <section>
        <h2 className="mb-3 font-semibold text-foreground">Today's reading</h2>
        {todayLogs.length === 0 ? (
          <EmptyState icon={BookOpen} title="No reading logged yet" subtitle="Even a few verses are a beautiful beginning." />
        ) : (
          <div className="space-y-2">
            {todayLogs.map((l) => (
              <div key={l.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{l.surah_name || "Reading"}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.pages ? `${l.pages} page${l.pages > 1 ? "s" : ""} · ` : ""}
                      {l.verses ? `${l.verses} verses` : ""}
                      {!l.pages && !l.verses ? "Logged" : ""}
                    </p>
                  </div>
                  <button onClick={() => remove(l.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {l.reflection && <p className="mt-2 text-sm italic text-muted-foreground">“{l.reflection}”</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-semibold text-primary text-xl")}>{value}</p>
    </div>
  );
}