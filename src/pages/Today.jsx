import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Flame, Sparkles, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Celestial from "@/components/Celestial";
import QuoteCard from "@/components/QuoteCard";
import SalahCard from "@/components/SalahCard";
import SalahLogDialog from "@/components/SalahLogDialog";
import TasbeehBeads from "@/components/TasbeehBeads";
import { PRAYERS } from "@/lib/constants";
import {
  todayStr, prayerStatusMap, countPrayedOnDate, computeStreak,
  tasbeehProgress, sumDhikr, sumQuranPages, quoteForDay,
} from "@/lib/spiritual";

export default function Today() {
  const navigate = useNavigate();
  const today = todayStr();

  const [settings, setSettings] = useState(null);
  const [salahLogs, setSalahLogs] = useState([]);
  const [dhikrLogs, setDhikrLogs] = useState([]);
  const [quranLogs, setQuranLogs] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showOpening, setShowOpening] = useState(false);
  const [dialog, setDialog] = useState(null); // { prayer, existing }
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    (async () => {
      const [s, sl, dl, ql, qs] = await Promise.all([
        base44.entities.UserSettings.list(),
        base44.entities.SalahLog.list("-date", 500),
        base44.entities.DhikrLog.list("-date", 500),
        base44.entities.QuranLog.list("-date", 500),
        base44.entities.Quote.list(),
      ]);
      const mySettings = s[0] || null;
      setSettings(mySettings);
      setSalahLogs(sl);
      setDhikrLogs(dl);
      setQuranLogs(ql);
      setQuotes(qs);
      setLoading(false);
      if (!mySettings || !mySettings.onboarded) {
        navigate("/onboarding");
        return;
      }
      if (mySettings.last_opened_date !== today) setShowOpening(true);
    })();
  }, []);

  const statusMap = useMemo(() => prayerStatusMap(salahLogs, today), [salahLogs, today]);
  const prayedToday = countPrayedOnDate(salahLogs, today);
  const streak = useMemo(() => computeStreak(salahLogs), [salahLogs]);
  const tasbeeh = useMemo(() => tasbeehProgress(salahLogs), [salahLogs]);
  const dhikrToday = useMemo(
    () => sumDhikr(dhikrLogs.filter((l) => l.date === today)),
    [dhikrLogs, today]
  );
  const quranToday = useMemo(
    () => sumQuranPages(quranLogs.filter((l) => l.date === today)),
    [quranLogs, today]
  );
  const dailyQuote = useMemo(() => quoteForDay(quotes), [quotes]);
  const isSaved = dailyQuote && settings?.favorite_quotes?.includes(dailyQuote.id);

  const beginToday = async () => {
    setShowOpening(false);
    await base44.entities.UserSettings.update(settings.id, { last_opened_date: today });
    setSettings({ ...settings, last_opened_date: today });
  };

  const toggleSaveQuote = async () => {
    if (!dailyQuote) return;
    const favs = settings.favorite_quotes || [];
    const next = isSaved ? favs.filter((id) => id !== dailyQuote.id) : [...favs, dailyQuote.id];
    await base44.entities.UserSettings.update(settings.id, { favorite_quotes: next });
    setSettings({ ...settings, favorite_quotes: next });
  };

  const openLog = (prayer) => {
    const existing = salahLogs.find((l) => l.date === today && l.prayer === prayer.id);
    setDialog({ prayer, existing });
  };

  const saveSalah = async ({ status, feeling, note }) => {
    const beadsBefore = tasbeeh.beads;
    const existing = dialog.existing;
    let updated;
    if (existing) {
      updated = await base44.entities.SalahLog.update(existing.id, { status, feeling, note });
      setSalahLogs((prev) => prev.map((l) => (l.id === existing.id ? { ...l, ...updated } : l)));
    } else {
      updated = await base44.entities.SalahLog.create({
        date: today, prayer: dialog.prayer.id, status, feeling, note,
      });
      setSalahLogs((prev) => [...prev, updated]);
    }
    // bead celebration: compare total prayed before vs after this save
    let newTotal = tasbeeh.total;
    if (status === "prayed" && !existing) newTotal = tasbeeh.total + 1;
    else if (existing) {
      const wasPrayed = existing.status === "prayed";
      const nowPrayed = status === "prayed";
      if (nowPrayed && !wasPrayed) newTotal = tasbeeh.total + 1;
      else if (!nowPrayed && wasPrayed) newTotal = tasbeeh.total - 1;
    }
    const newBeads = Math.floor(newTotal / 5);
    if (newBeads > beadsBefore) {
      setCelebration({ bead: true });
      setTimeout(() => setCelebration(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // New or not-yet-onboarded users are redirected to onboarding (triggered in the effect above).
  if (!settings || !settings.onboarded) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Assalamu Alaikum</p>
          <h1 className="font-display text-2xl text-secondary">
            {settings.display_name ? `${settings.display_name}` : "Welcome back"}
          </h1>
          <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMMM")}</p>
        </div>
        <button
          onClick={() => navigate("/history")}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-secondary hover:border-primary/40"
          aria-label="View history"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {/* Daily quote */}
      <QuoteCard quote={dailyQuote} saved={isSaved} onToggleSave={toggleSaveQuote} />

      {/* Today's Salah */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Today's Salah</h2>
          <span className="text-sm font-medium text-primary">{prayedToday} / 5</span>
        </div>
        <div className="space-y-2.5">
          {PRAYERS.map((p) => (
            <SalahCard key={p.id} prayer={p} status={statusMap[p.id]} onClick={() => openLog(p)} />
          ))}
        </div>
      </section>

      {/* Today's Progress */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 font-semibold text-foreground">Today's Progress</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <ProgressTile icon={Flame} label="Salah" value={`${prayedToday}/5`} />
          <ProgressTile icon={Sparkles} label="Dhikr" value={`${dhikrToday}`} />
          <ProgressTile icon={BookOpen} label="Quran" value={`${quranToday}p`} />
        </div>
      </section>

      {/* Current Streak */}
      <section className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Current streak</p>
            <p className="font-display text-3xl text-primary">{streak.current} days</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Longest: {streak.longest} days
            </p>
          </div>
          <Celestial size={40} />
        </div>
      </section>

      {/* Collection Progress */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Your Tasbeeh</h2>
          <button onClick={() => navigate("/collection")} className="text-xs font-medium text-primary">
            View collection
          </button>
        </div>
        <TasbeehBeads currentBeads={tasbeeh.currentBeads} />
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Next bead</span>
            <span>{tasbeeh.total % 5} / 5 salah</span>
          </div>
          <Progress value={(tasbeeh.total % 5) * 20} className="h-1.5" />
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground italic">
          {tasbeeh.completeTasbeehs > 0
            ? `${tasbeeh.completeTasbeehs} complete tasbeeh${tasbeeh.completeTasbeehs > 1 ? "s" : ""} — keep going.`
            : "Every bead represents a moment you showed up."}
        </p>
      </section>

      {/* Salah log dialog */}
      {dialog && (
        <SalahLogDialog
          open={!!dialog}
          onOpenChange={(o) => !o && setDialog(null)}
          prayer={dialog.prayer}
          date={today}
          existing={dialog.existing}
          onSaved={saveSalah}
        />
      )}

      {/* Daily opening overlay */}
      <AnimatePresence>
        {showOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center parchment px-6 text-center"
          >
            <Celestial size={48} />
            <motion.h1
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mt-6 font-display text-4xl text-secondary"
            >
              Assalamu Alaikum
            </motion.h1>
            {dailyQuote && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 w-full">
                <QuoteCard quote={dailyQuote} />
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 w-full max-w-xs">
              <Button onClick={beginToday} className="w-full rounded-xl">
                Begin today's tracking
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bead celebration */}
      <AnimatePresence>
        {celebration?.bead && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 inset-x-4 mx-auto max-w-sm rounded-2xl border border-accent/40 bg-card p-4 text-center shadow-lg z-50"
          >
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary" />
            <p className="font-semibold text-primary">A new bead has been added.</p>
            <p className="text-xs text-muted-foreground">Keep showing up — your tasbeeh is growing.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1 font-semibold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}