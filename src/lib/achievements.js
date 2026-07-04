/* Rozetler + haftalık rapor — kayıtlardan kural tabanlı hesaplanır. */
import { nutritionTotals, workoutCalories, getDay } from "./store";
import { macroTargets, lastNDays, todayKey, shiftKey } from "./utils";

function dayHasActivity(state, k) {
  const d = state.logs[k];
  if (!d) return false;
  const food = d.meals && Object.values(d.meals).some((m) => m.length > 0);
  return food || (d.workouts && d.workouts.length > 0);
}

export function currentStreak(state) {
  let n = 0, cur = todayKey();
  while (dayHasActivity(state, cur)) { n++; cur = shiftKey(cur, -1); }
  return n;
}

export function totalWorkouts(state) {
  return Object.values(state.logs).reduce((s, d) => s + (d.workouts ? d.workouts.length : 0), 0);
}

/* Kalori hedefini ±%10 tutturulan gün sayısı */
export function onTargetDays(state) {
  const t = macroTargets(state.profile).kcal;
  if (!t) return 0;
  return Object.keys(state.logs).filter((k) => {
    const kcal = nutritionTotals(state, k).kcal;
    return kcal > 0 && Math.abs(kcal - t) <= t * 0.1;
  }).length;
}

export function maxWaterDay(state) {
  return Object.values(state.logs).reduce((m, d) => Math.max(m, d.water || 0), 0);
}

export function computeBadges(state) {
  const streak = currentStreak(state);
  const workouts = totalWorkouts(state);
  const onTarget = onTargetDays(state);
  const water = maxWaterDay(state);
  const weightLogs = (state.weights || []).length;
  const anyFood = Object.values(state.logs).some((d) => d.meals && Object.values(d.meals).some((m) => m.length));

  const defs = [
    { id: "first-log", name: "İlk Adım", desc: "İlk besinini kaydet", icon: "nutrition", earned: anyFood },
    { id: "first-workout", name: "İlk Antrenman", desc: "İlk antrenmanını tamamla", icon: "workout", earned: workouts >= 1 },
    { id: "streak-7", name: "7 Gün Seri", desc: "7 gün kesintisiz kayıt", icon: "flame", earned: streak >= 7, progress: Math.min(streak / 7, 1) },
    { id: "streak-30", name: "30 Gün Seri", desc: "30 gün kesintisiz kayıt", icon: "flame", earned: streak >= 30, progress: Math.min(streak / 30, 1) },
    { id: "workout-10", name: "Düzenli", desc: "10 antrenman tamamla", icon: "workout", earned: workouts >= 10, progress: Math.min(workouts / 10, 1) },
    { id: "workout-50", name: "Kararlı", desc: "50 antrenman tamamla", icon: "target", earned: workouts >= 50, progress: Math.min(workouts / 50, 1) },
    { id: "hydrated", name: "Su Şampiyonu", desc: "Bir günde 8 bardak su", icon: "droplet", earned: water >= 8, progress: Math.min(water / 8, 1) },
    { id: "on-target-7", name: "Hedefte", desc: "7 gün kalori hedefini tuttur", icon: "check", earned: onTarget >= 7, progress: Math.min(onTarget / 7, 1) },
    { id: "weight-track", name: "Takipçi", desc: "5 kilo kaydı gir", icon: "scale", earned: weightLogs >= 5, progress: Math.min(weightLogs / 5, 1) },
  ];
  return defs;
}

/* Son 7 günün özeti */
export function weeklyReport(state, endKey) {
  const keys = lastNDays(7, endKey || todayKey());
  let kcalSum = 0, kcalDays = 0, workouts = 0, burned = 0, waterSum = 0, active = 0;
  keys.forEach((k) => {
    const t = nutritionTotals(state, k);
    if (t.kcal > 0) { kcalSum += t.kcal; kcalDays++; }
    const d = getDay(state, k);
    workouts += d.workouts.length;
    burned += workoutCalories(state, k);
    waterSum += d.water || 0;
    if (dayHasActivity(state, k)) active++;
  });
  const target = macroTargets(state.profile).kcal;
  return {
    avgKcal: kcalDays ? Math.round(kcalSum / kcalDays) : 0,
    workouts,
    burned,
    avgWater: Math.round((waterSum / 7) * 10) / 10,
    activeDays: active,
    target,
  };
}
