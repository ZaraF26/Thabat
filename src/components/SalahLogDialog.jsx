import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SALAH_STATUSES, FEELINGS } from "@/lib/constants";

// Dialog to log a single salah: status (required) + optional feeling + optional note.
export default function SalahLogDialog({ open, onOpenChange, prayer, date, existing, onSaved }) {
  const [status, setStatus] = useState(existing?.status || "prayed");
  const [feeling, setFeeling] = useState(existing?.feeling || "");
  const [note, setNote] = useState(existing?.note || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(existing?.status || "prayed");
      setFeeling(existing?.feeling || "");
      setNote(existing?.note || "");
    }
  }, [open, existing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaved({ status, feeling, note });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">Log {prayer?.name}</DialogTitle>
          <DialogDescription className="text-center">
            Track this prayer — every log counts toward your journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
            <div className="grid grid-cols-3 gap-2">
              {SALAH_STATUSES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    "rounded-xl border px-2 py-2.5 text-xs font-medium transition-all",
                    status === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              How did you feel? <span className="font-normal normal-case">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFeeling(feeling === f ? "" : f)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-all",
                    feeling === f
                      ? "border-accent bg-accent/20 text-accent-foreground"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            placeholder="A short reflection (optional)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="resize-none"
          />

          <Button onClick={handleSave} disabled={saving} className="w-full rounded-xl">
            {saving ? "Saving…" : "Save log"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}