import type {
  ActivityLevel,
  DietType,
  Gender,
  Goal,
  Macros,
} from "./types";

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
};

// macro split as fractions of total calories: [protein, carbs, fat]
const DIET_MACRO_SPLIT: Record<DietType, [number, number, number]> = {
  balanced: [0.3, 0.4, 0.3],
  high_protein: [0.4, 0.35, 0.25],
  vegetarian: [0.25, 0.5, 0.25],
  vegan: [0.25, 0.5, 0.25],
  keto: [0.25, 0.05, 0.7],
  mediterranean: [0.25, 0.45, 0.3],
};

/** Mifflin-St Jeor Basal Metabolic Rate. */
export function calcBMR(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

/** Total Daily Energy Expenditure. */
export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_FACTORS[activity];
}

export function calcTargetCalories(
  gender: Gender,
  weightKg: number,
  heightCm: number,
  age: number,
  activity: ActivityLevel,
  goal: Goal
): number {
  const tdee = calcTDEE(calcBMR(gender, weightKg, heightCm, age), activity);
  const target = tdee + GOAL_ADJUSTMENT[goal];
  // keep a safe floor
  return Math.max(1200, Math.round(target / 10) * 10);
}

export function calcMacros(calories: number, diet: DietType): Macros {
  const [p, c, f] = DIET_MACRO_SPLIT[diet];
  return {
    protein: Math.round((calories * p) / 4),
    carbs: Math.round((calories * c) / 4),
    fat: Math.round((calories * f) / 9),
  };
}
