import { useState, useEffect, useMemo } from "react";
import { Star, Moon, Sparkles, Flower2, Leaf, BookOpen, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Celestial from "@/components/Celestial";
import TasbeehBeads from "@/components/TasbeehBeads";
import PrayerMat from "@/components/PrayerMat";
import { PRAYER_MAT_STYLES, COLLECTION_ITEMS, COLLECTION_CATEGORIES, TASBEEH_PER_MAT, BEADS_PER_TASBEEH } from "@/lib/constants";
import { computeStats, tasbeehProgress } from "@/lib/spiritual";
import { cn } from "@/lib/utils";

const ICONS = { star: Star, moon: Moon, lantern: Sparkles, flower: Flower2, leaf: Leaf, book: BookOpen };

export default function Collection() {
  const [salahLogs, setSalahLogs] = useState([]);
  const [dhikrLogs, setDhikrLogs] = useState([]);
  const [quranLogs, setQuranLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SalahLog.list("-date", 1000),
      base44.entities.DhikrLog.list("-date", 1000),
      base44.entities.QuranLog.list("-date", 1000),
    ]).then(([s, d, q]) => { setSalahLogs(s); setDhikrLogs(d); setQuranLogs(q); setLoading(false); });
  }, []);

  const stats = useMemo(() => computeStats(salahLogs, dhikrLogs, quranLogs), [salahLogs, dhikrLogs, quranLogs]);
  const tasbeeh = useMemo(() => tasbeehProgress(salahLogs), [salahLogs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-secondary">Collection</h1>
          <p className="text-xs text-muted-foreground">Symbolic keepsakes of your consistency.</p>
        </div>
        <Celestial size={28} />
      </div>

      {/* Tasbeeh */}
      <Section title="Tasbeeh" subtitle={`${tasbeeh.completeTasbeehs} complete · ${tasbeeh.currentBeads} beads on current string`}>
        <TasbeehBeads currentBeads={tasbeeh.currentBeads} />
        <p className="mt-3 text-center text-xs text-muted-foreground italic">
          {tasbeeh.completeTasbeehs > 0
            ? "Keep going. Every bead represents a moment you showed up."
            : "Your tasbeeh begins with the first bead."}
        </p>
      </Section>

      {/* Prayer Mats */}
      <Section title="Prayer Mats" subtitle={`${tasbeeh.completeTasbeehs} complete tasbeeh · 1 mat per ${TASBEEH_PER_MAT}`}>
        <div className="grid grid-cols-2 gap-3">
          {PRAYER_MAT_STYLES.map((style, i) => {
            const unlocked = tasbeeh.completeTasbeehs >= (i + 1) * TASBEEH_PER_MAT;
            return (
              <div key={style.id} className={cn("rounded-2xl border p-3 text-center", unlocked ? "border-accent/40 bg-card" : "border-border bg-muted/30")}>
                <PrayerMat style={style} locked={!unlocked} className="w-full h-auto" />
                <p className={cn("mt-2 text-xs font-medium", unlocked ? "text-foreground" : "text-muted-foreground")}>{style.name}</p>
                {!unlocked && <p className="text-[10px] text-muted-foreground/70">Unlocks at {(i + 1) * TASBEEH_PER_MAT} complete tasbeeh</p>}
              </div>
            );
          })}
        </div>
      </Section>

      {/* Other categories */}
      {COLLECTION_CATEGORIES.filter((c) => c !== "Tasbeeh" && c !== "Prayer Mats").map((cat) => {
        const items = COLLECTION_ITEMS.filter((it) => it.category === cat);
        if (!items.length) return null;
        return (
          <Section key={cat} title={cat}>
            <div className="grid grid-cols-3 gap-3">
              {items.map((it) => {
                const unlocked = stats[it.stat] >= it.value;
                const Icon = ICONS[it.icon] || Star;
                return (
                  <div key={it.id} className={cn("rounded-2xl border p-3 text-center", unlocked ? "border-accent/40 bg-card" : "border-border bg-muted/30")}>
                    <div className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full", unlocked ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground/50")}>
                      {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <p className={cn("mt-2 text-[11px] font-medium leading-tight", unlocked ? "text-foreground" : "text-muted-foreground")}>{it.name}</p>
                    {!unlocked && <p className="text-[9px] text-muted-foreground/70 mt-0.5">{it.value} {it.stat.replace(/([A-Z])/g, " $1").toLowerCase()}</p>}
                  </div>
                );
              })}
            </div>
          </Section>
        );
      })}

      <p className="text-center text-xs text-muted-foreground italic px-4">
        Rewards are symbolic motivational keepsakes — not a measure of spiritual worth.
      </p>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4">
      <h2 className="font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mb-3">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </section>
  );
}