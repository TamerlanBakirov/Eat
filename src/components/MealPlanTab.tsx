"use client";

import { useState } from "react";
import { MEAL_LABELS, MEAL_ORDER } from "@/lib/labels";
import { buildShoppingList } from "@/lib/shopping";
import { useAppStore, todayKey } from "@/lib/store";
import type { Meal, MealPlan, UserProfile } from "@/lib/types";
import { Button, Card, cn } from "./ui";

export function MealPlanTab({ profile }: { profile: UserProfile }) {
  const mealPlan = useAppStore((s) => s.mealPlan);
  const setMealPlan = useAppStore((s) => s.setMealPlan);
  const setShoppingList = useAppStore((s) => s.setShoppingList);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(0);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bir hata oluştu");
      const plan = data.plan as MealPlan;
      setMealPlan(plan);
      setShoppingList(buildShoppingList(plan));
      setActiveDay(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }

  if (!mealPlan) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold">Öğün Planı</h1>
        <Card className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="text-5xl">🍽️</div>
          <div>
            <p className="font-semibold">Henüz bir planın yok</p>
            <p className="mt-1 text-sm text-slate-500">
              Hedeflerine göre 7 günlük kişisel öğün planını AI oluştursun.
            </p>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Oluşturuluyor… (~30 sn)" : "✨ Planımı oluştur"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </Card>
      </div>
    );
  }

  const day = mealPlan.days[activeDay];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Öğün Planı</h1>
        <Button variant="ghost" onClick={generate} disabled={loading}>
          {loading ? "…" : "↻ Yenile"}
        </Button>
      </div>

      {mealPlan.summary && (
        <Card className="bg-brand-50 ring-brand-100">
          <p className="text-sm text-brand-800">{mealPlan.summary}</p>
        </Card>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* day selector */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {mealPlan.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
              i === activeDay
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            )}
          >
            {d.day}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {[...day.meals]
          .sort(
            (a, b) =>
              MEAL_ORDER.indexOf(a.type) - MEAL_ORDER.indexOf(b.type)
          )
          .map((meal, i) => (
            <MealCard key={i} meal={meal} />
          ))}
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const [open, setOpen] = useState(false);
  const addFood = useAppStore((s) => s.addFood);
  const [added, setAdded] = useState(false);

  function logMeal() {
    addFood(todayKey(), {
      name: meal.name,
      mealType: meal.type,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
            {MEAL_LABELS[meal.type]}
          </p>
          <p className="font-semibold">{meal.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {Math.round(meal.calories)} kcal · P{Math.round(meal.protein)} · K
            {Math.round(meal.carbs)} · Y{Math.round(meal.fat)}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-slate-400 hover:text-slate-700"
          aria-label="Detay"
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          <div>
            <p className="mb-1 text-xs font-bold text-slate-500">
              Malzemeler
            </p>
            <ul className="space-y-1 text-sm text-slate-600">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between">
                  <span>{ing.name}</span>
                  <span className="text-slate-400">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold text-slate-500">Tarif</p>
            <p className="whitespace-pre-line text-sm text-slate-600">
              {meal.recipe}
            </p>
          </div>
        </div>
      )}

      <Button
        variant={added ? "primary" : "secondary"}
        onClick={logMeal}
        className="mt-3 w-full"
      >
        {added ? "✓ Günlüğe eklendi" : "Bugüne ekle"}
      </Button>
    </Card>
  );
}
