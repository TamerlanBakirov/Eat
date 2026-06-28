import type {
  ActivityLevel,
  DietType,
  Goal,
  MealType,
} from "./types";

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Kilo vermek",
  maintain: "Kiloyu korumak",
  gain: "Kilo almak",
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Hareketsiz (masa başı)",
  light: "Hafif aktif (haftada 1-3 gün)",
  moderate: "Orta aktif (haftada 3-5 gün)",
  active: "Çok aktif (haftada 6-7 gün)",
  very_active: "Aşırı aktif (fiziksel iş / günde 2 antrenman)",
};

export const DIET_LABELS: Record<DietType, string> = {
  balanced: "Dengeli",
  high_protein: "Yüksek protein",
  vegetarian: "Vejetaryen",
  vegan: "Vegan",
  keto: "Ketojenik",
  mediterranean: "Akdeniz",
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Kahvaltı",
  lunch: "Öğle",
  dinner: "Akşam",
  snack: "Ara öğün",
};

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "snack", "dinner"];
