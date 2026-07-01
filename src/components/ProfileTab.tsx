"use client";

import {
  ACTIVITY_LABELS,
  DIET_LABELS,
  GOAL_LABELS,
} from "@/lib/labels";
import { useAppStore } from "@/lib/store";
import type { UserProfile } from "@/lib/types";
import { Button, Card } from "./ui";

export function ProfileTab({ profile }: { profile: UserProfile }) {
  const logout = useAppStore((s) => s.logout);
  const user = useAppStore((s) => s.user);

  const rows: [string, string][] = [
    ["İsim", profile.name],
    ["Yaş", String(profile.age)],
    ["Cinsiyet", profile.gender === "male" ? "Erkek" : "Kadın"],
    ["Boy", `${profile.heightCm} cm`],
    ["Kilo", `${profile.weightKg} kg`],
    ["Hedef", GOAL_LABELS[profile.goal]],
    ["Aktivite", ACTIVITY_LABELS[profile.activityLevel]],
    ["Diyet", DIET_LABELS[profile.dietType]],
    ["Öğün/gün", String(profile.mealsPerDay)],
    [
      "Alerjiler",
      profile.allergies.length ? profile.allergies.join(", ") : "—",
    ],
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Profil</h1>

      <Card className="flex flex-col items-center bg-brand-600 text-white">
        <p className="text-sm opacity-80">Günlük hedefin</p>
        <p className="text-4xl font-bold">{profile.targetCalories}</p>
        <p className="text-sm opacity-80">kcal</p>
        <div className="mt-3 flex gap-4 text-sm">
          <span>P {profile.targetMacros.protein}g</span>
          <span>K {profile.targetMacros.carbs}g</span>
          <span>Y {profile.targetMacros.fat}g</span>
        </div>
      </Card>

      <Card className="divide-y divide-slate-100 p-0">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-slate-500">{k}</span>
            <span className="font-medium text-slate-800">{v}</span>
          </div>
        ))}
      </Card>

      {user && (
        <p className="text-center text-xs text-slate-400">
          Giriş yapılan hesap: {user.email}
        </p>
      )}

      <Button variant="danger" className="w-full" onClick={() => logout()}>
        Çıkış yap
      </Button>
    </div>
  );
}
