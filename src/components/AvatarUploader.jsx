import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";

export default function AvatarUploader({ url, name, onChange, className }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-primary text-xl font-semibold text-primary-foreground",
        className || "h-14 w-14"
      )}
      aria-label="Change profile picture"
    >
      {url ? (
        <Image src={url} alt={name || "Profile picture"} className="absolute inset-0 h-full w-full" fittingType="fill" />
      ) : (
        <span>{(name || "Y").charAt(0).toUpperCase()}</span>
      )}
      <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-secondary text-secondary-foreground">
        <Camera className="h-3 w-3" />
      </span>
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-secondary/50">
          <span className="h-5 w-5 border-2 border-card border-t-transparent rounded-full animate-spin" />
        </span>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </button>
  );
}