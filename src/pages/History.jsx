import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, parseISO, isSameMonth, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";
import Celestial from "@/components/Celestial";
import { PRAYERS } from "@/lib/constants";
import {
  countPrayedOnDate, prayerStatusMap, sumDhikr, sumQuranPages, quoteForDay,
} from "@/lib/spiritual";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function History() {
  const [month, setMonth] = useState(new Date());
  const [salahLogs, setSalahLogs] = useState([]);
  const [dhikrLogs, setDhikrLogs] = useState([]);
  const [quranLogs, setQuranLogs] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.SalahLog.list("-date", 1000),
      base44.entities.DhikrLog.list("-date", 1000),
      base44.entities.QuranLog.list("-date", 1000),
      base44.entities.Reflection.list("-date", 500),
      base44.entities.Quote.list(),
    ]).then(([s, d, q, r, qs]) => {
      setSalahLogs(s); setDhikrLogs(d); setQuranLogs(q); setReflections(r); setQuotes(qs);
    });
  }, []);

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const offset = (start.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    const d = new Date(start);
    while (isSameMonth(d, month)) {
      cells.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return cells;
  }, [month]);

  const selectedStr = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedDetail = useMemo(() => {
    if (!selectedStr) return null;
    return {
      statuses: prayerStatusMap(salahLogs, selectedStr),
      prayed: countPrayedOnDate(salahLogs, selectedStr),
      dhikr: sumDhikr(dhikrLogs.filter((l) => l.date === selectedStr)),
      quran: sumQuranPages(quranLogs.filter((l) => l.date === selectedStr)),
      reflection: reflections.find((r) => r.date === selectedStr && r.type === "daily")?.text,
      quote: quoteForDay(quotes, parseISO(selectedStr)),
    };
  }, [selectedStr, salahLogs, dhikrLogs, quranLogs, reflections, quotes]);

  const cellFill = (count) => {
    if (count >= 5) return "bg-primary text-primary-foreground";
    if (count === 4) return "bg-accent text-accent-foreground";
    if (count === 3) return "bg-secondary/70 text-secondary-foreground";
    if (count === 2) return "bg-muted text-secondary";
    if (count === 1) return "bg-muted/60 text-muted-foreground";
    return "bg-transparent text-muted-foreground border border-border";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-secondary">History</h1>
          <p className="text-xs text-muted-foreground">Your journey, day by day.</p>
        </div>
        <Celestial size={28} />
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
        <button onClick={() => setMonth(subMonths(month, 1))} className="p-1.5 rounded-full hover:bg-muted" aria-label="Previous month">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-semibold text-foreground">{format(month, "MMMM yyyy")}</p>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-1.5 rounded-full hover:bg-muted" aria-label="Next month">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const ds = format(d, "yyyy-MM-dd");
            const count = countPrayedOnDate(salahLogs, ds);
            const isSel = selectedStr === ds;
            return (
              <button
                key={i}
                onClick={() => setSelected(d)}
                className={cn(
                  "aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5",
                  cellFill(count),
                  isSel && "ring-2 ring-primary ring-offset-1 ring-offset-card"
                )}
              >
                <span>{format(d, "d")}</span>
                <span className="text-[9px] opacity-80">{count > 0 ? `${count}/5` : ""}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
        <LegendDot className="bg-primary" label="5/5" />
        <LegendDot className="bg-accent" label="4/5" />
        <LegendDot className="bg-secondary/70" label="3/5" />
        <LegendDot className="bg-muted" label="2/5" />
        <LegendDot className="border border-border" label="0/5" />
      </div>

      {/* Day detail */}
      {selectedDetail && (
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <p className="font-semibold text-foreground">{format(selected, "EEEE, d MMMM")}</p>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">Salah · {selectedDetail.prayed}/5</p>
            <div className="flex flex-wrap gap-1.5">
              {PRAYERS.map((p) => {
                const st = selectedDetail.statuses[p.id];
                return (
                  <span key={p.id} className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium border",
                    st === "prayed" ? "border-primary bg-primary/10 text-primary" :
                    st === "qada" ? "border-accent bg-accent/10 text-accent-foreground" :
                    st === "missed" ? "border-border bg-muted text-muted-foreground" :
                    "border-dashed border-border text-muted-foreground/60"
                  )}>
                    {p.name}{st === "prayed" ? " ✓" : st === "qada" ? " (qada)" : st === "missed" ? "" : ""}
                  </span>
                );
              })}
            </div>
          </div>
          <Row label="Dhikr" value={selectedDetail.dhikr ? `${selectedDetail.dhikr} counts` : "—"} />
          <Row label="Quran" value={selectedDetail.quran ? `${selectedDetail.quran} pages` : "—"} />
          {selectedDetail.reflection && (
            <p className="text-sm italic text-muted-foreground">“{selectedDetail.reflection}”</p>
          )}
          {selectedDetail.quote && (
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="font-display text-sm text-secondary text-center">“{selectedDetail.quote.text}”</p>
              <p className="text-center text-[11px] text-muted-foreground mt-1">{selectedDetail.quote.source}</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function LegendDot({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-full", className)} />
      {label}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}