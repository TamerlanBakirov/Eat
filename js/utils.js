/* Yardımcı fonksiyonlar: tarih, format, sağlık hesaplamaları */
window.Utils = (function () {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function todayKey() {
    return dateToKey(new Date());
  }

  function dateToKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function keyToDate(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function shiftKey(key, days) {
    return dateToKey(new Date(keyToDate(key).getTime() + days * DAY_MS));
  }

  function lastNDays(n, endKey) {
    const keys = [];
    for (let i = n - 1; i >= 0; i--) keys.push(shiftKey(endKey, -i));
    return keys;
  }

  const DAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const MONTH_NAMES = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  function formatKey(key) {
    const d = keyToDate(key);
    return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${DAY_NAMES[d.getDay()]}`;
  }

  function shortDay(key) {
    return DAY_NAMES[keyToDate(key).getDay()];
  }

  function round(n, dec = 0) {
    const f = Math.pow(10, dec);
    return Math.round(n * f) / f;
  }

  function fmt(n, dec = 0) {
    return round(n, dec).toLocaleString("tr-TR");
  }

  /* Mifflin-St Jeor formülü ile bazal metabolizma hızı (BMR) */
  function bmr(profile) {
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
  function tdee(profile) {
    return bmr(profile) * (ACTIVITY_FACTORS[profile.activityLevel] || 1.2);
  }

  /* Hedefe göre günlük kalori hedefi */
  function calorieTarget(profile) {
    const base = tdee(profile);
    if (!base) return 2000;
    const goalAdj = { lose: -500, maintain: 0, gain: 400 };
    return Math.round(base + (goalAdj[profile.goal] || 0));
  }

  /* Makro hedefleri: protein 1.8 g/kg, yağ %27, kalan karbonhidrat */
  function macroTargets(profile) {
    const kcal = calorieTarget(profile);
    const protein = Math.round((profile.weight || 70) * 1.8);
    const fat = Math.round((kcal * 0.27) / 9);
    const carb = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    return { kcal, protein, carb, fat };
  }

  function bmi(profile) {
    if (!profile.weight || !profile.height) return 0;
    const h = profile.height / 100;
    return profile.weight / (h * h);
  }

  function bmiLabel(v) {
    if (v <= 0) return "-";
    if (v < 18.5) return "Zayıf";
    if (v < 25) return "Normal";
    if (v < 30) return "Fazla Kilolu";
    return "Obez";
  }

  /* MET tabanlı kalori yakımı: kcal = MET × kg × saat */
  function burnedCalories(met, weightKg, minutes) {
    return Math.round(met * (weightKg || 70) * (minutes / 60));
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[ch]));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  return {
    todayKey, dateToKey, keyToDate, shiftKey, lastNDays,
    formatKey, shortDay, round, fmt,
    bmr, tdee, calorieTarget, macroTargets, bmi, bmiLabel, burnedCalories,
    esc, uid,
  };
})();
