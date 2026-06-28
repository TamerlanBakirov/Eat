"use client";

import { useState } from "react";
import { MEAL_LABELS, MEAL_ORDER } from "@/lib/labels";
import { useAppStore, todayKey } from "@/lib/store";
import type { LoggedFood, MealType, UserProfile } from "@/lib/types";
import { Button, Card, CalorieRing, MacroBar, cn } from "./ui";

function sumFoods(foods: LoggedFood[]) {
  return foods.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function TodayTab({ profile }: { profile: UserProfile }) {
  const date = todayKey();
  const foodLog = useAppStore((s) => s.foodLog);
  const removeFood = useAppStore((s) => s.removeFood);
  const [showAdd, setShowAdd] = useState(false);

  const foods = foodLog[date] ?? [];
  const totals = sumFoods(foods);
  const m = profile.targetMacros;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Merhaba {profile.name} 👋</h1>
        <p className="text-sm text-slate-500">Bugünkü ilerlemen</p>
      </div>

      <Card className="flex flex-col items-center">
        <CalorieRing
          consumed={totals.calories}
          target={profile.targetCalories}
        />
        <div className="mt-5 grid w-full grid-cols-1 gap-3">
          <MacroBar
            label="Protein"
            value={totals.protein}
            target={m.protein}
            color="#16a34a"
          />
          <MacroBar
            label="Karbonhidrat"
            value={totals.carbs}
            target={m.carbs}
            color="#f59e0b"
          />
          <MacroBar
            label="Yağ"
            value={totals.fat}
            target={m.fat}
            color="#3b82f6"
          />
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="font-bold">Günlük</h2>
        <Button variant="secondary" onClick={() => setShowAdd((v) => !v)}>
          + Yemek ekle
        </Button>
      </div>

      {showAdd && (
        <AddFoodForm date={date} onDone={() => setShowAdd(false)} />
      )}

      {foods.length === 0 ? (
        <p className="rounded-xl bg-white py-8 text-center text-sm text-slate-400 ring-1 ring-slate-100">
          Henüz bir şey eklemedin. Yediklerini kaydet, kaloriler otomatik
          toplansın.
        </p>
      ) : (
        <div className="space-y-3">
          {MEAL_ORDER.map((type) => {
            const items = foods.filter((f) => f.mealType === type);
            if (items.length === 0) return null;
            return (
              <Card key={type} className="p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {MEAL_LABELS[type]}
                </p>
                <ul className="space-y-2">
                  {items.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">{f.name}</p>
                        <p className="text-xs text-slate-400">
                          P{Math.round(f.protein)} · K{Math.round(f.carbs)} · Y
                          {Math.round(f.fat)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {Math.round(f.calories)} kcal
                        </span>
                        <button
                          onClick={() => removeFood(date, f.id)}
                          className="text-slate-300 hover:text-red-500"
                          aria-label="Sil"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddFoodForm({
  date,
  onDone,
}: {
  date: string;
  onDone: () => void;
}) {
  const addFood = useAppStore((s) => s.addFood);
  const [name, setName] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  function submit() {
    if (!name.trim() || !calories) return;
    addFood(date, {
      name: name.trim(),
      mealType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    onDone();
  }

  return (
    <Card className="space-y-3">
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        placeholder="Yemek adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {MEAL_ORDER.map((t) => (
          <button
            key={t}
            onClick={() => setMealType(t)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition",
              mealType === t
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600"
            )}
          >
            {MEAL_LABELS[t]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <MiniInput placeholder="kcal" value={calories} onChange={setCalories} />
        <MiniInput placeholder="P (g)" value={protein} onChange={setProtein} />
        <MiniInput placeholder="K (g)" value={carbs} onChange={setCarbs} />
        <MiniInput placeholder="Y (g)" value={fat} onChange={setFat} />
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={onDone} className="flex-1">
          İptal
        </Button>
        <Button onClick={submit} className="flex-1">
          Ekle
        </Button>
      </div>
    </Card>
  );
}

function MiniInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-center text-sm outline-none focus:border-brand-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
