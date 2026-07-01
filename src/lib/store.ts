import { create } from "zustand";
import { api } from "./api";
import type {
  AuthUser,
  LoggedFood,
  MealPlan,
  MealType,
  ShoppingItem,
  UserProfile,
} from "./types";

export function todayKey(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

interface AppState {
  status: "loading" | "ready";
  user: AuthUser | null;
  profile: UserProfile | null;
  mealPlan: MealPlan | null;
  foods: LoggedFood[]; // today's entries
  shoppingList: ShoppingItem[];

  bootstrap: () => Promise<void>;
  afterAuth: (user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;

  saveProfile: (profile: UserProfile) => Promise<void>;

  generateMealPlan: () => Promise<void>;

  addFood: (food: Omit<LoggedFood, "id">) => Promise<void>;
  removeFood: (id: string) => Promise<void>;

  toggleShoppingItem: (id: string, checked: boolean) => Promise<void>;
}

async function loadUserData(set: (partial: Partial<AppState>) => void) {
  const [{ profile }, { plan }, { foods }, { items }] = await Promise.all([
    api.getProfile(),
    api.getMealPlan(),
    api.getFoods(todayKey()),
    api.getShopping(),
  ]);
  set({
    profile,
    mealPlan: plan,
    foods,
    shoppingList: items,
  });
}

export const useAppStore = create<AppState>()((set, get) => ({
  status: "loading",
  user: null,
  profile: null,
  mealPlan: null,
  foods: [],
  shoppingList: [],

  bootstrap: async () => {
    try {
      const { user } = await api.me();
      if (user) {
        set({ user });
        await loadUserData(set);
      }
    } catch {
      /* unauthenticated or offline */
    } finally {
      set({ status: "ready" });
    }
  },

  afterAuth: async (user) => {
    set({ user });
    await loadUserData(set);
  },

  logout: async () => {
    await api.logout().catch(() => {});
    set({
      user: null,
      profile: null,
      mealPlan: null,
      foods: [],
      shoppingList: [],
    });
  },

  saveProfile: async (profile) => {
    const { profile: saved } = await api.saveProfile(profile);
    set({ profile: saved });
  },

  generateMealPlan: async () => {
    const { plan } = await api.generateMealPlan();
    const { items } = await api.getShopping();
    set({ mealPlan: plan, shoppingList: items });
  },

  addFood: async (food) => {
    const { food: saved } = await api.addFood({ ...food, date: todayKey() });
    set({ foods: [...get().foods, saved] });
  },

  removeFood: async (id) => {
    set({ foods: get().foods.filter((f) => f.id !== id) });
    await api.removeFood(id).catch(() => {});
  },

  toggleShoppingItem: async (id, checked) => {
    set({
      shoppingList: get().shoppingList.map((it) =>
        it.id === id ? { ...it, checked } : it
      ),
    });
    await api.toggleShopping(id, checked).catch(() => {});
  },
}));

export type { MealType };
