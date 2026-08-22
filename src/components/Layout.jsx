import { NavLink, Outlet } from "react-router-dom";
import { Sunrise, Sparkles, BookOpen, Award, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Today", icon: Sunrise, end: true },
  { to: "/dhikr", label: "Dhikr", icon: Sparkles },
  { to: "/quran", label: "Quran", icon: BookOpen },
  { to: "/collection", label: "Collection", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-6 pb-28">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-40">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}