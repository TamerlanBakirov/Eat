import type {
  Profile as DbProfile,
  MealPlan as DbMealPlan,
} from "@prisma/client";
import type {
  ActivityLevel,
  DayPlan,
  DietType,
  Gender,
  Goal,
  MealPlan,
  UserProfile,
} from "./types";

export function profileFromDb(row: DbProfile): UserProfile {
  let allergies: string[] = [];
  try {
    const parsed = JSON.parse(row.allergies);
    if (Array.isArray(parsed)) allergies = parsed.map(String);
  } catch {
    /* ignore malformed */
  }
  return {
    name: row.name,
    age: row.age,
    gender: row.gender as Gender,
    heightCm: row.heightCm,
    weightKg: row.weightKg,
    goal: row.goal as Goal,
    activityLevel: row.activityLevel as ActivityLevel,
    dietType: row.dietType as DietType,
    mealsPerDay: row.mealsPerDay,
    allergies,
    targetCalories: row.targetCalories,
    targetMacros: {
      protein: row.proteinTarget,
      carbs: row.carbsTarget,
      fat: row.fatTarget,
    },
  };
}

/** Maps an incoming UserProfile to Prisma create/update fields. */
export function profileToDb(p: UserProfile) {
  return {
    name: p.name,
    age: p.age,
    gender: p.gender,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    goal: p.goal,
    activityLevel: p.activityLevel,
    dietType: p.dietType,
    mealsPerDay: p.mealsPerDay,
    allergies: JSON.stringify(p.allergies ?? []),
    targetCalories: p.targetCalories,
    proteinTarget: p.targetMacros.protein,
    carbsTarget: p.targetMacros.carbs,
    fatTarget: p.targetMacros.fat,
  };
}

export function mealPlanFromDb(row: DbMealPlan): MealPlan {
  let days: DayPlan[] = [];
  try {
    const parsed = JSON.parse(row.days);
    if (Array.isArray(parsed)) days = parsed as DayPlan[];
  } catch {
    /* ignore */
  }
  return {
    summary: row.summary,
    days,
    generatedAt: row.generatedAt.toISOString(),
  };
}
