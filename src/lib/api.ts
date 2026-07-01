import type {
  AuthUser,
  LoggedFood,
  MealPlan,
  ShoppingItem,
  UserProfile,
} from "./types";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Bir hata oluştu.");
  }
  return data as T;
}

export const api = {
  // --- auth ---
  me: () => request<{ user: AuthUser | null }>("/api/auth/me"),

  register: (email: string, password: string) =>
    request<{ user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  // --- profile ---
  getProfile: () =>
    request<{ profile: UserProfile | null }>("/api/profile"),

  saveProfile: (profile: UserProfile) =>
    request<{ profile: UserProfile }>("/api/profile", {
      method: "PUT",
      body: JSON.stringify({ profile }),
    }),

  // --- meal plan ---
  getMealPlan: () => request<{ plan: MealPlan | null }>("/api/meal-plan"),

  generateMealPlan: () =>
    request<{ plan: MealPlan }>("/api/meal-plan", { method: "POST" }),

  // --- food log ---
  getFoods: (date: string) =>
    request<{ foods: LoggedFood[] }>(`/api/food?date=${encodeURIComponent(date)}`),

  addFood: (food: Omit<LoggedFood, "id"> & { date: string }) =>
    request<{ food: LoggedFood }>("/api/food", {
      method: "POST",
      body: JSON.stringify(food),
    }),

  removeFood: (id: string) =>
    request<{ ok: true }>(`/api/food?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  // --- shopping ---
  getShopping: () => request<{ items: ShoppingItem[] }>("/api/shopping"),

  toggleShopping: (id: string, checked: boolean) =>
    request<{ ok: true }>("/api/shopping", {
      method: "PATCH",
      body: JSON.stringify({ id, checked }),
    }),
};
