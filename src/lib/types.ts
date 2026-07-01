export type Gender = "male" | "female";

export type Goal = "lose" | "maintain" | "gain";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type DietType =
  | "balanced"
  | "high_protein"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "mediterranean";

export interface Macros {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  dietType: DietType;
  allergies: string[];
  mealsPerDay: number;
  // computed targets
  targetCalories: number;
  targetMacros: Macros;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface Ingredient {
  name: string;
  amount: string; // e.g. "100 g", "1 adet"
}

export interface Meal {
  type: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Ingredient[];
  recipe: string;
}

export interface DayPlan {
  day: string; // e.g. "Pazartesi"
  meals: Meal[];
}

export interface MealPlan {
  generatedAt: string;
  summary: string;
  days: DayPlan[];
}

export interface LoggedFood {
  id: string;
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// date (YYYY-MM-DD) -> logged foods
export type FoodLog = Record<string, LoggedFood[]>;

export interface ShoppingItem {
  id?: string;
  name: string;
  amount: string;
  checked: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
}
