/* Uygulama durumu: React Context + AsyncStorage kalıcılığı */
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FOOD_DB } from "../data/foods";
import { uid } from "./utils";

const STORAGE_KEY = "fitlife-data-v1";

export const DEFAULT_STATE = {
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
  settings: { theme: "dark" },
};

export function emptyDay() {
  return {
    meals: { kahvalti: [], ogle: [], aksam: [], ara: [] },
    water: 0,
    workouts: [],
  };
}

/* --- Seçiciler (pure) --- */

export function getDay(state, dateKey) {
  return state.logs[dateKey] || emptyDay();
}

export function allFoods(state) {
  return FOOD_DB.concat(state.customFoods);
}

export function nutritionTotals(state, dateKey) {
  const day = getDay(state, dateKey);
  const t = { kcal: 0, p: 0, c: 0, f: 0 };
  Object.values(day.meals).forEach((entries) =>
    entries.forEach((e) => {
      t.kcal += e.kcal; t.p += e.p; t.c += e.c; t.f += e.f;
    })
  );
  return t;
}

export function workoutCalories(state, dateKey) {
  return getDay(state, dateKey).workouts.reduce((s, w) => s + (w.kcal || 0), 0);
}

/* Egzersiz başına en iyi set (kişisel rekor) */
export function personalRecords(state) {
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

/* --- Reducer --- */

function withDay(state, dateKey, updater) {
  const day = getDay(state, dateKey);
  return {
    ...state,
    logs: { ...state.logs, [dateKey]: updater(structuredClone(day)) },
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_FOOD":
      return withDay(state, action.dateKey, (day) => {
        day.meals[action.meal].push({ id: uid(), ...action.entry });
        return day;
      });

    case "REMOVE_FOOD":
      return withDay(state, action.dateKey, (day) => {
        day.meals[action.meal] = day.meals[action.meal].filter((e) => e.id !== action.entryId);
        return day;
      });

    case "ADD_CUSTOM_FOOD":
      return {
        ...state,
        customFoods: [...state.customFoods, { id: "custom-" + uid(), cat: "Özel", ...action.food }],
      };

    case "SET_WATER":
      return withDay(state, action.dateKey, (day) => {
        day.water = Math.max(0, action.glasses);
        return day;
      });

    case "ADD_WORKOUT":
      return withDay(state, action.dateKey, (day) => {
        day.workouts.push({ id: uid(), ...action.workout });
        return day;
      });

    case "REMOVE_WORKOUT":
      return withDay(state, action.dateKey, (day) => {
        day.workouts = day.workouts.filter((w) => w.id !== action.workoutId);
        return day;
      });

    case "ADD_WEIGHT": {
      const weights = state.weights
        .filter((w) => w.date !== action.dateKey)
        .concat({ date: action.dateKey, kg: action.kg })
        .sort((a, b) => a.date.localeCompare(b.date));
      return { ...state, weights, profile: { ...state.profile, weight: action.kg } };
    }

    case "REMOVE_WEIGHT":
      return { ...state, weights: state.weights.filter((w) => w.date !== action.dateKey) };

    case "UPDATE_PROFILE":
      return { ...state, profile: { ...state.profile, ...action.patch } };

    case "SET_THEME":
      return { ...state, settings: { ...state.settings, theme: action.theme } };

    case "RESET":
      return structuredClone(DEFAULT_STATE);

    default:
      return state;
  }
}

/* --- Context --- */

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);
  const hydrated = useRef(false);

  // Açılışta kayıtlı veriyi yükle
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: "HYDRATE", state: { ...structuredClone(DEFAULT_STATE), ...parsed } });
        }
      } catch (e) {
        console.warn("Veri yüklenemedi, varsayılanlar kullanılıyor:", e);
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Her değişiklikte kaydet (hydration öncesi yazma yapma)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn("Veri kaydedilemedi:", e)
    );
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData, DataProvider içinde kullanılmalı");
  return ctx;
}

/* --- Seçili tarih bağlamı --- */

const DateContext = createContext(null);

export function DateProvider({ children }) {
  const [dateKey, setDateKey] = React.useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const value = useMemo(() => ({ dateKey, setDateKey }), [dateKey]);
  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
}

export function useDate() {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error("useDate, DateProvider içinde kullanılmalı");
  return ctx;
}
