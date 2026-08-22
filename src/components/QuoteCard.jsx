import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Warm parchment-style quote card with subtle celestial decoration.
export default function QuoteCard({ quote, saved, onToggleSave, className }) {
  if (!quote) return null;
  return (
    <div
      className={cn(
        "parchment relative overflow-hidden rounded-2xl border border-accent/40 p-5 shadow-sm",
        className
      )}
    >
      <div className="absolute -top-3 -right-3 text-accent/30 select-none" aria-hidden="true">
        <span className="text-4xl">✦</span>
      </div>
      <div className="absolute -bottom-4 -left-2 text-accent/20 select-none" aria-hidden="true">
        <span className="text-3xl">☾</span>
      </div>
      <p className="font-display text-lg leading-relaxed text-secondary text-center px-2">
        “{quote.text}”
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <span className="h-px w-6 bg-accent/50" />
        <p className="text-xs font-medium text-muted-foreground tracking-wide">{quote.source}</p>
        <span className="h-px w-6 bg-accent/50" />
      </div>
      {onToggleSave && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onToggleSave}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              saved ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", saved && "fill-primary")} />
            {saved ? "Saved" : "Save reminder"}
          </button>
        </div>
      )}
    </div>
  );
}