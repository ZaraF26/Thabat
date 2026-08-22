import { useState, useEffect, useMemo } from "react";
import { startOfWeek, startOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import Celestial from "@/components/Celestial";
import { DHIKR_TYPES, DHIKR_QUICK_ADDS } from "@/lib/constants";
import { todayStr, sumDhikr } from "@/lib/spiritual";
import { cn } from "@/lib/utils";

export default function Dhikr() {
  const today = todayStr();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("SubhanAllah");
  const [customType, setCustomType] = useState("");
  const [count, setCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.DhikrLog.list("-date", 500).then((rows) => {
      setLogs(rows);
      setLoading(false);
    });
  }, []);

  const todayLogs = useMemo(() => logs.filter((l) => l.date === today), [logs, today]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const todaySum = sumDhikr(todayLogs);
    const weekSum = sumDhikr(logs.filter((l) => isWithinInterval(parseISO(l.date), { start: weekStart, end: now })));
    const monthSum = sumDhikr(logs.filter((l) => isWithinInterval(parseISO(l.date), { start: monthStart, end: now })));
    const allSum = sumDhikr(logs);

    // personal best = best single-day total
    const byDay = {};
    logs.forEach((l) => { byDay[l.date] = (byDay[l.date] || 0) + l.count; });
    const personalBest = Object.values(byDay).reduce((m, v) => Math.max(m, v), 0);

    // favourite dhikr = highest total count type
    const byType = {};
    logs.forEach((l) => { byType[l.dhikr_type] = (byType[l.dhikr_type] || 0) + l.count; });
    const favourite = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { todaySum, weekSum, monthSum, allSum, personalBest, favourite };
  }, [logs, todayLogs, today]);

  const add = async () => {
    const dhikrType = type === "Custom" ? customType.trim() : type;
    if (!dhikrType || count <= 0) return;
    setSaving(true);
    try {
      const created = await base44.entities.DhikrLog.create({ date: today, dhikr_type: dhikrType, count: Number(count) });
      setLogs((prev) => [created, ...prev]);
      setCount(0);
      setCustomType("");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.DhikrLog.delete(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  const activeType = type === "Custom" ? customType : type;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-secondary">Dhikr</h1>
          <p className="text-xs text-muted-foreground">Remember Allah; hearts find rest.</p>
        </div>
        <Celestial size={28} />
      </div>

      {/* Add form */}
      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dhikr</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DHIKR_TYPES.map((d) => (
                <SelectItem key={d} value={d}>{d === "Custom" ? "Custom…" : d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {type === "Custom" && (
            <Input
              placeholder="Enter your dhikr"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="rounded-xl"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Count</Label>
          <Input
            type="number"
            value={count || ""}
            onChange={(e) => setCount(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="rounded-xl text-lg font-semibold"
          />
          <div className="grid grid-cols-4 gap-2 pt-1">
            {DHIKR_QUICK_ADDS.map((n) => (
              <button
                key={n}
                onClick={() => setCount((c) => c + n)}
                className="rounded-xl border border-border py-2 text-sm font-medium hover:border-primary/40"
              >
                +{n}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={add} disabled={saving || !activeType || count <= 0} className="w-full rounded-xl">
          <Plus className="h-4 w-4 mr-1" /> Log dhikr
        </Button>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard label="Today" value={stats.todaySum} />
        <StatCard label="This week" value={stats.weekSum} />
        <StatCard label="This month" value={stats.monthSum} />
        <StatCard label="All time" value={stats.allSum} />
        <StatCard label="Personal best (day)" value={stats.personalBest} />
        <StatCard label="Favourite" value={stats.favourite} small />
      </section>

      {/* Today's entries */}
      <section>
        <h2 className="mb-3 font-semibold text-foreground">Today's entries</h2>
        {todayLogs.length === 0 ? (
          <EmptyState icon={Sparkles} title="No dhikr logged yet" subtitle="Take a moment to remember — even a single count matters." />
        ) : (
          <div className="space-y-2">
            {todayLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <div>
                  <p className="font-medium text-foreground">{l.dhikr_type}</p>
                  <p className="text-xs text-muted-foreground">{l.count} times</p>
                </div>
                <button onClick={() => remove(l.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, small }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-semibold text-primary", small ? "text-base" : "text-2xl")}>{value}</p>
    </div>
  );
}