import { Moon, Sun, CloudSun, Sunset, MoonStar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { moon: Moon, sun: Sun, "cloud-sun": CloudSun, sunset: Sunset, "moon-star": MoonStar };

// A single salah card. Tap to log. Visual state changes when completed.
export default function SalahCard({ prayer, status, onClick }) {
  const Icon = ICONS[prayer.icon] || Moon;
  const prayed = status === "prayed";
  const qada = status === "qada";
  const missed = status === "missed";

  return (
    <button
      onClick={onClick}
      aria-label={`Log ${prayer.name}`}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-all active:scale-[0.98]",
        prayed
          ? "border-primary/40 bg-primary/10 shadow-sm"
          : qada
          ? "border-accent/40 bg-accent/10"
          : missed
          ? "border-border bg-muted/40 opacity-80"
          : "border-border bg-card hover:border-primary/30"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
            prayed ? "bg-primary text-primary-foreground" : "bg-muted text-secondary"
          )}
        >
          {prayed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold leading-tight", prayed ? "text-primary" : "text-foreground")}>
            {prayer.name}
          </p>
          <p className="text-xs text-muted-foreground">{prayer.time}</p>
        </div>
        <span className="text-xs font-medium text-right">
          {prayed ? (
            <span className="text-primary">Completed</span>
          ) : qada ? (
            <span className="text-accent">Made up</span>
          ) : missed ? (
            <span className="text-muted-foreground">Missed</span>
          ) : (
            <span className="text-muted-foreground/70">Tap to log</span>
          )}
        </span>
      </div>
    </button>
  );
}