import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, subtitle, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10 px-6", className)}>
      {Icon && (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <p className="font-medium text-foreground">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground max-w-xs">{subtitle}</p>}
    </div>
  );
}