/* Uygulama durumu ve localStorage kalıcılığı */
window.Store = (function () {
  const KEY = "fitlife-data-v1";

  const DEFAULT_STATE = {
    profile: {
      name: "",
      age: 25,
      gender: "male",
      height: 175,
      weight: 75,
      activityLevel: "moderate",
      goal: "maintain",
    },
    /* logs["YYYY-MM-DD"] = { meals: {...}, water: 0, workouts: [] } */
    logs: {},
    /* weights: [{ date: "YYYY-MM-DD", kg: 75 }] — tarihe göre sıralı */
    weights: [],
    customFoods: [],
    settings: { theme: "light" },
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      return Object.assign(structuredClone(DEFAULT_STATE), parsed);
    } catch (e) {
      console.error("Veri yüklenemedi, varsayılanlar kullanılıyor:", e);
      return structuredClone(DEFAULT_STATE);
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function emptyDay() {
    return {
      meals: { kahvalti: [], ogle: [], aksam: [], ara: [] },
      water: 0,
      workouts: [],
    };
  }

  function getDay(dateKey) {
    if (!state.logs[dateKey]) state.logs[dateKey] = emptyDay();
    const day = state.logs[dateKey];
    // Eski kayıtlarla uyumluluk için eksik alanları tamamla
    if (!day.meals) day.meals = emptyDay().meals;
    if (!day.workouts) day.workouts = [];
    if (typeof day.water !== "number") day.water = 0;
    return day;
  }

  /* --- Beslenme --- */

  function addFoodEntry(dateKey, meal, entry) {
    const day = getDay(dateKey);
    day.meals[meal].push(Object.assign({ id: Utils.uid() }, entry));
    save();
  }

  function removeFoodEntry(dateKey, meal, entryId) {
    const day = getDay(dateKey);
    day.meals[meal] = day.meals[meal].filter((e) => e.id !== entryId);
    save();
  }

  function addCustomFood(food) {
    state.customFoods.push(Object.assign({ id: "custom-" + Utils.uid(), cat: "Özel" }, food));
    save();
  }

  function allFoods() {
    return FOOD_DB.concat(state.customFoods);
  }

  /* Günün beslenme toplamları */
  function nutritionTotals(dateKey) {
    const day = getDay(dateKey);
    const t = { kcal: 0, p: 0, c: 0, f: 0 };
    Object.values(day.meals).forEach((entries) =>
      entries.forEach((e) => {
        t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f;
      })
    );
    return t;
  }

  function mealTotals(dateKey, meal) {
    return getDay(dateKey).meals[meal].reduce((sum, e) => sum + e.kcal, 0);
  }

  /* --- Su --- */

  function setWater(dateKey, glasses) {
    getDay(dateKey).water = Math.max(0, glasses);
    save();
  }

  /* --- Antrenman --- */

  function addWorkout(dateKey, workout) {
    const day = getDay(dateKey);
    day.workouts.push(Object.assign({ id: Utils.uid() }, workout));
    save();
  }

  function removeWorkout(dateKey, workoutId) {
    const day = getDay(dateKey);
    day.workouts = day.workouts.filter((w) => w.id !== workoutId);
    save();
  }

  function workoutCalories(dateKey) {
    return getDay(dateKey).workouts.reduce((sum, w) => sum + (w.kcal || 0), 0);
  }

  /* Bir egzersizin geçmişteki en iyi seti (kişisel rekor) */
  function personalRecords() {
    const prs = {};
    Object.entries(state.logs).forEach(([date, day]) => {
      (day.workouts || []).forEach((w) => {
        (w.exercises || []).forEach((ex) => {
          (ex.sets || []).forEach((s) => {
            if (!s.weight) return;
            const cur = prs[ex.name];
            if (!cur || s.weight > cur.weight) {
              prs[ex.name] = { weight: s.weight, reps: s.reps, date };
            }
          });
        });
      });
    });
    return prs;
  }

  /* --- Kilo takibi --- */

  function addWeight(dateKey, kg) {
    state.weights = state.weights.filter((w) => w.date !== dateKey);
    state.weights.push({ date: dateKey, kg });
    state.weights.sort((a, b) => a.date.localeCompare(b.date));
    state.profile.weight = kg;
    save();
  }

  function removeWeight(dateKey) {
    state.weights = state.weights.filter((w) => w.date !== dateKey);
    save();
  }

  /* --- Profil & ayarlar --- */

  function updateProfile(patch) {
    Object.assign(state.profile, patch);
    save();
  }

  function setTheme(theme) {
    state.settings.theme = theme;
    save();
  }

  /* --- Dışa/içe aktarma --- */

  function exportJSON() {
    return JSON.stringify(state, null, 2);
  }

  function importJSON(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object" || !parsed.profile) {
      throw new Error("Geçersiz veri dosyası");
    }
    state = Object.assign(structuredClone(DEFAULT_STATE), parsed);
    save();
  }

  function resetAll() {
    state = structuredClone(DEFAULT_STATE);
    save();
  }

  return {
    get state() { return state; },
    save, getDay,
    addFoodEntry, removeFoodEntry, addCustomFood, allFoods,
    nutritionTotals, mealTotals,
    setWater,
    addWorkout, removeWorkout, workoutCalories, personalRecords,
    addWeight, removeWeight,
    updateProfile, setTheme,
    exportJSON, importJSON, resetAll,
  };
})();
