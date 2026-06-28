import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  FoodLog,
  LoggedFood,
  MealPlan,
  ShoppingItem,
  UserProfile,
} from "./types";

interface AppState {
  profile: UserProfile | null;
  mealPlan: MealPlan | null;
  foodLog: FoodLog;
  shoppingList: ShoppingItem[];

  setProfile: (profile: UserProfile) => void;
  resetProfile: () => void;

  setMealPlan: (plan: MealPlan) => void;

  addFood: (date: string, food: Omit<LoggedFood, "id">) => void;
  removeFood: (date: string, id: string) => void;

  setShoppingList: (items: ShoppingItem[]) => void;
  toggleShoppingItem: (index: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      mealPlan: null,
      foodLog: {},
      shoppingList: [],

      setProfile: (profile) => set({ profile }),
      resetProfile: () =>
        set({
          profile: null,
          mealPlan: null,
          foodLog: {},
          shoppingList: [],
        }),

      setMealPlan: (mealPlan) => set({ mealPlan }),

      addFood: (date, food) =>
        set((state) => {
          const entry: LoggedFood = {
            ...food,
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          };
          const dayList = state.foodLog[date] ?? [];
          return {
            foodLog: { ...state.foodLog, [date]: [...dayList, entry] },
          };
        }),

      removeFood: (date, id) =>
        set((state) => {
          const dayList = state.foodLog[date] ?? [];
          return {
            foodLog: {
              ...state.foodLog,
              [date]: dayList.filter((f) => f.id !== id),
            },
          };
        }),

      setShoppingList: (shoppingList) => set({ shoppingList }),
      toggleShoppingItem: (index) =>
        set((state) => {
          const list = [...state.shoppingList];
          if (list[index]) {
            list[index] = { ...list[index], checked: !list[index].checked };
          }
          return { shoppingList: list };
        }),
    }),
    { name: "eat-app-storage" }
  )
);

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
