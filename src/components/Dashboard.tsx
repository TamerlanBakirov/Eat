"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { cn } from "./ui";
import { TodayTab } from "./TodayTab";
import { MealPlanTab } from "./MealPlanTab";
import { ShoppingTab } from "./ShoppingTab";
import { ProfileTab } from "./ProfileTab";

type Tab = "today" | "plan" | "shopping" | "profile";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "today", label: "Bugün", icon: "📊" },
  { id: "plan", label: "Plan", icon: "🍽️" },
  { id: "shopping", label: "Market", icon: "🛒" },
  { id: "profile", label: "Profil", icon: "👤" },
];

export function Dashboard({ profile }: { profile: UserProfile }) {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <div className="mx-auto min-h-screen max-w-md">
      <main className="px-4 pb-28 pt-8">
        {tab === "today" && <TodayTab profile={profile} />}
        {tab === "plan" && <MealPlanTab profile={profile} />}
        {tab === "shopping" && <ShoppingTab />}
        {tab === "profile" && <ProfileTab profile={profile} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs font-medium transition",
                tab === t.id ? "text-brand-600" : "text-slate-400"
              )}
            >
              <span className="text-lg">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
