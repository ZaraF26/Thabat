import { BEADS_PER_TASBEEH } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Visual tasbeeh string. Filled beads = completed, empty = remaining.
export default function TasbeehBeads({ currentBeads, total = BEADS_PER_TASBEEH, size = "md" }) {
  const filled = Math.min(currentBeads, total);
  const beads = Array.from({ length: total });
  const dim = size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5";
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="img" aria-label={`${filled} of ${total} beads`}>
      {beads.map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all",
            dim,
            i < filled
              ? "bg-gradient-to-br from-accent to-primary shadow-sm"
              : "bg-muted border border-border"
          )}
        />
      ))}
    </div>
  );
}