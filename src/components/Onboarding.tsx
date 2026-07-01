"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITY_LABELS,
  DIET_LABELS,
  GOAL_LABELS,
} from "@/lib/labels";
import { calcMacros, calcTargetCalories } from "@/lib/nutrition";
import { useAppStore } from "@/lib/store";
import type {
  ActivityLevel,
  DietType,
  Gender,
  Goal,
  UserProfile,
} from "@/lib/types";
import { Button, Card, cn } from "./ui";

const TOTAL_STEPS = 4;

export function Onboarding() {
  const saveProfile = useAppStore((s) => s.saveProfile);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(75);
  const [goal, setGoal] = useState<Goal>("lose");
  const [activityLevel, setActivityLevel] =
    useState<ActivityLevel>("moderate");
  const [dietType, setDietType] = useState<DietType>("balanced");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [allergiesText, setAllergiesText] = useState("");

  const targetCalories = useMemo(
    () =>
      calcTargetCalories(
        gender,
        weightKg,
        heightCm,
        age,
        activityLevel,
        goal
      ),
    [gender, weightKg, heightCm, age, activityLevel, goal]
  );
  const targetMacros = useMemo(
    () => calcMacros(targetCalories, dietType),
    [targetCalories, dietType]
  );

  async function finish() {
    const profile: UserProfile = {
      name: name.trim() || "Misafir",
      age,
      gender,
      heightCm,
      weightKg,
      goal,
      activityLevel,
      dietType,
      mealsPerDay,
      allergies: allergiesText
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      targetCalories,
      targetMacros,
    };
    setSaving(true);
    setError(null);
    try {
      await saveProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
      setSaving(false);
    }
  }

  const canNext =
    step === 0 ? age > 0 && heightCm > 0 && weightKg > 0 : true;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-8">
      <div className="mb-6 text-center">
        <div className="mb-2 text-3xl font-extrabold text-brand-600">🥗 Eat</div>
        <p className="text-sm text-slate-500">
          Sana özel plan için birkaç soru
        </p>
      </div>

      {/* progress */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= step ? "bg-brand-500" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <Card className="flex-1">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Seni tanıyalım</h2>
            <Field label="İsim">
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Yaş">
                <NumberInput value={age} onChange={setAge} min={12} max={100} />
              </Field>
              <Field label="Cinsiyet">
                <div className="flex gap-2">
                  <ChoicePill
                    active={gender === "male"}
                    onClick={() => setGender("male")}
                  >
                    Erkek
                  </ChoicePill>
                  <ChoicePill
                    active={gender === "female"}
                    onClick={() => setGender("female")}
                  >
                    Kadın
                  </ChoicePill>
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Boy (cm)">
                <NumberInput
                  value={heightCm}
                  onChange={setHeightCm}
                  min={120}
                  max={230}
                />
              </Field>
              <Field label="Kilo (kg)">
                <NumberInput
                  value={weightKg}
                  onChange={setWeightKg}
                  min={35}
                  max={250}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Hedefin ne?</h2>
            <div className="space-y-2">
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <OptionRow
                  key={g}
                  active={goal === g}
                  onClick={() => setGoal(g)}
                  title={GOAL_LABELS[g]}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Ne kadar aktifsin?</h2>
            <div className="space-y-2">
              {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                <OptionRow
                  key={a}
                  active={activityLevel === a}
                  onClick={() => setActivityLevel(a)}
                  title={ACTIVITY_LABELS[a]}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Beslenme tercihlerin</h2>
            <Field label="Diyet tipi">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(DIET_LABELS) as DietType[]).map((d) => (
                  <ChoicePill
                    key={d}
                    active={dietType === d}
                    onClick={() => setDietType(d)}
                  >
                    {DIET_LABELS[d]}
                  </ChoicePill>
                ))}
              </div>
            </Field>
            <Field label={`Günde öğün sayısı: ${mealsPerDay}`}>
              <input
                type="range"
                min={2}
                max={5}
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(Number(e.target.value))}
                className="w-full"
              />
            </Field>
            <Field label="Alerji / kaçınılanlar (virgülle ayır)">
              <input
                className="input"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="örn. fındık, laktoz, deniz ürünleri"
              />
            </Field>

            <div className="rounded-xl bg-brand-50 p-4">
              <p className="text-sm font-semibold text-brand-800">
                Hesaplanan günlük hedefin
              </p>
              <p className="mt-1 text-2xl font-bold text-brand-700">
                {targetCalories} kcal
              </p>
              <p className="mt-1 text-xs text-brand-700">
                P {targetMacros.protein}g · K {targetMacros.carbs}g · Y{" "}
                {targetMacros.fat}g
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            Geri
          </Button>
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button
            className="flex-1"
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
          >
            Devam
          </Button>
        ) : (
          <Button className="flex-1" onClick={finish} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Başla"}
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-600">{error}</p>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <input
      type="number"
      className="input"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

function ChoicePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-brand-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}
    >
      {children}
    </button>
  );
}

function OptionRow({
  active,
  onClick,
  title,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition",
        active
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      )}
    >
      {title}
      <span
        className={cn(
          "ml-3 h-4 w-4 shrink-0 rounded-full border-2",
          active ? "border-brand-600 bg-brand-600" : "border-slate-300"
        )}
      />
    </button>
  );
}
