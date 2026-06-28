import type { MealPlan, ShoppingItem } from "./types";

/** Aggregate every ingredient in the plan into a de-duplicated shopping list. */
export function buildShoppingList(plan: MealPlan): ShoppingItem[] {
  const map = new Map<string, string[]>();
  for (const day of plan.days) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients) {
        const key = ing.name.trim().toLocaleLowerCase("tr");
        const list = map.get(key) ?? [];
        list.push(ing.amount);
        map.set(key, list);
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, amounts]) => ({
      name: capitalize(name),
      amount: amounts.join(" + "),
      checked: false,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function capitalize(s: string): string {
  return s.charAt(0).toLocaleUpperCase("tr") + s.slice(1);
}
