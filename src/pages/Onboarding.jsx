import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Celestial from "@/components/Celestial";
import { FOCUS_OPTIONS, APP_NAME } from "@/lib/constants";

// Post-signup introduction: choose what to track + focus. Salah always on.
export default function Onboarding() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [track, setTrack] = useState({ salah: true, dhikr: true, quran: true });
  const [focus, setFocus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.UserSettings.list().then((rows) => {
      if (rows[0]) {
        setSettings(rows[0]);
        setTrack({
          salah: rows[0].track_salah ?? true,
          dhikr: rows[0].track_dhikr ?? true,
          quran: rows[0].track_quran ?? true,
        });
        setFocus(rows[0].focus || "");
      }
    });
  }, []);

  const finish = async () => {
    setSaving(true);
    try {
      const payload = {
        track_salah: true,
        track_dhikr: track.dhikr,
        track_quran: track.quran,
        focus: focus || "",
        onboarded: true,
      };
      if (settings) {
        await base44.entities.UserSettings.update(settings.id, payload);
      } else {
        await base44.entities.UserSettings.create(payload);
      }
      navigate("/");
    } finally {
      setSaving(false);
    }
  };

  const TrackChip = ({ id, label, desc, locked }) => (
    <button
      disabled={locked}
      onClick={() => setTrack((t) => ({ ...t, [id]: !t[id] }))}
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
        track[id] ? "border-primary bg-primary/5" : "border-border bg-card",
        locked && "opacity-90"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
          track[id] ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {track[id] && <span className="text-[10px]">✓</span>}
      </span>
      <span>
        <span className="block font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
        <div className="text-center">
          <Celestial className="justify-center" size={28} />
          <h1 className="mt-3 font-display text-3xl text-secondary">Welcome to {APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Steadfast, one prayer at a time.</p>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-foreground">What would you like to track?</h2>
          <div className="space-y-2.5">
            <TrackChip id="salah" label="Salah" desc="Your five daily prayers" locked />
            <TrackChip id="dhikr" label="Dhikr" desc="Remembrance and tasbeeh counting" />
            <TrackChip id="quran" label="Quran" desc="Pages, verses and surahs read" />
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-semibold text-foreground">What would you like to focus on?</h2>
          <div className="space-y-2">
            {FOCUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFocus(opt)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm transition-all",
                  focus === opt ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate("/")} className="flex-1 rounded-xl">
            Skip for now
          </Button>
          <Button onClick={finish} disabled={saving} className="flex-1 rounded-xl">
            {saving ? "Saving…" : "Begin"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}