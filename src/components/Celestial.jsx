import { Moon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Decorative crescent + stars motif. Purely aesthetic celestial decoration.
export default function Celestial({ className, size = 24 }) {
  return (
    <div className={cn("flex items-center gap-1 text-accent", className)} aria-hidden="true">
      <Star className="fill-accent" style={{ width: size * 0.5, height: size * 0.5 }} />
      <Moon style={{ width: size, height: size }} className="fill-accent/80" />
      <Star className="fill-accent/70" style={{ width: size * 0.4, height: size * 0.4 }} />
    </div>
  );
}