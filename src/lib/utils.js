/* Yardımcı fonksiyonlar: tarih, format, sağlık hesaplamaları */
const DAY_MS = 24 * 60 * 60 * 1000;

export function todayKey() {
  return dateToKey(new Date());
}

export function dateToKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function keyToDate(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftKey(key, days) {
  return dateToKey(new Date(keyToDate(key).getTime() + days * DAY_MS));
}

export function lastNDays(n, endKey) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) keys.push(shiftKey(endKey, -i));
  return keys;
}

const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export function formatKey(key) {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${DAY_NAMES[d.getDay()]}`;
}

export function shortDay(key) {
  return DAY_NAMES[keyToDate(key).getDay()];
}

export function round(n, dec = 0) {
  const f = Math.pow(10, dec);
  return Math.round(n * f) / f;
}

export function fmt(n, dec = 0) {
  return round(n, dec).toLocaleString("tr-TR");
}

/* TextInput'tan gelen "72,5" gibi değerleri sayıya çevirir */
export function parseNum(s) {
  const n = parseFloat(String(s ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/* Mifflin-St Jeor formülü ile bazal metabolizma hızı (BMR) */
export function bmr(profile) {
  const { weight, height, age, gender } = profile;
  if (!weight || !height || !age) return 0;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "female" ? base - 161 : base + 5;
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/* Günlük toplam enerji harcaması (TDEE) */
export function tdee(profile) {
  return bmr(profile) * (ACTIVITY_FACTORS[profile.activityLevel] || 1.2);
}

/* Hedefe göre günlük kalori hedefi */
export function calorieTarget(profile) {
  const base = tdee(profile);
  if (!base) return 2000;
  const goalAdj = { lose: -500, maintain: 0, gain: 400 };
  return Math.round(base + (goalAdj[profile.goal] || 0));
}

/* Makro hedefleri: protein 1.8 g/kg, yağ %27, kalan karbonhidrat */
export function macroTargets(profile) {
  const kcal = calorieTarget(profile);
  const protein = Math.round((profile.weight || 70) * 1.8);
  const fat = Math.round((kcal * 0.27) / 9);
  const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carb, fat };
}

export function bmi(profile) {
  if (!profile.weight || !profile.height) return 0;
  const h = profile.height / 100;
  return profile.weight / (h * h);
}

export function bmiLabel(v) {
  if (v <= 0) return "-";
  if (v < 18.5) return "Zayıf";
  if (v < 25) return "Normal";
  if (v < 30) return "Fazla Kilolu";
  return "Obez";
}

/* MET tabanlı kalori yakımı: kcal = MET × kg × saat */
export function burnedCalories(met, weightKg, minutes) {
  return Math.round(met * (weightKg || 70) * (minutes / 60));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* Öğün adları */
export const MEAL_NAMES = {
  kahvalti: "Kahvaltı",
  ogle: "Öğle Yemeği",
  aksam: "Akşam Yemeği",
  ara: "Ara Öğün",
};

/* Saate göre öğün tespiti — yemek eklerken varsayılan öğünü belirler */
export function currentMealKey(d = new Date()) {
  const h = d.getHours();
  if (h >= 4 && h < 11) return "kahvalti";
  if (h >= 11 && h < 16) return "ogle";
  if (h >= 16 && h < 22) return "aksam";
  return "ara";
}

/* 24 saatlik "HH:MM" damgası */
export function timeStamp(d = new Date()) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
