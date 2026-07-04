/* Kural tabanlı spor + beslenme programı üretici.
   Profil (hedef, aktivite, cinsiyet, kilo) → haftalık antrenman split'i + günlük beslenme planı.
   Çevrimdışı, deterministik, güvenilir. */
import { EXERCISE_DB } from "../data/exercises";
import { macroTargets, tdee } from "./utils";

const byId = (id) => EXERCISE_DB.find((e) => e.id === id);

/* Hedefe göre set/tekrar şeması */
function scheme(goal) {
  if (goal === "gain") return { sets: 4, reps: 7, cardio: 15 };   // hipertrofi/kuvvet
  if (goal === "lose") return { sets: 3, reps: 14, cardio: 30 };  // yağ yakımı, yüksek tekrar + kardiyo
  return { sets: 3, reps: 11, cardio: 20 };                        // koru
}

/* Aktiviteye göre haftalık antrenman günü sayısı */
function daysForActivity(level) {
  return { sedentary: 3, light: 3, moderate: 4, active: 5, very_active: 5 }[level] || 3;
}

/* Bir günün egzersizlerini kur */
function buildDay(key, name, focus, ids, sc, cardioId) {
  const exercises = ids.map((id) => {
    const ex = byId(id);
    if (!ex) return null;
    if (ex.type === "cardio") {
      return { exerciseId: ex.id, name: ex.name, type: "cardio", met: ex.met, sets: 1, reps: 0, duration: sc.cardio };
    }
    return { exerciseId: ex.id, name: ex.name, type: "strength", met: ex.met, sets: sc.sets, reps: ex.cat === "Karın" ? sc.reps + 4 : sc.reps };
  }).filter(Boolean);
  if (cardioId) {
    const cx = byId(cardioId);
    if (cx) exercises.push({ exerciseId: cx.id, name: cx.name, type: "cardio", met: cx.met, sets: 1, reps: 0, duration: Math.round(sc.cardio * 0.6) });
  }
  return { key, name, focus, exercises };
}

/* Split şablonları (gün sayısına göre) */
function buildSplit(days, sc, goal) {
  const extraCardio = goal === "lose";
  if (days <= 3) {
    return [
      buildDay("fbA", "Tüm Vücut A", "Bileşik güç", ["squat", "bench-press", "barbell-row", "overhead-press", "plank"], sc, extraCardio ? "kosu" : null),
      buildDay("fbB", "Tüm Vücut B", "Bileşik güç", ["deadlift", "incline-press", "lat-pulldown", "lunge", "crunch"], sc, extraCardio ? "bisiklet" : null),
      buildDay("cond", "Kondisyon & Karın", "Kardiyo + kor", ["hiit", "leg-raise", "russian-twist", "plank"], sc, null),
    ];
  }
  if (days === 4) {
    return [
      buildDay("upA", "Üst Vücut A", "İtiş odaklı", ["bench-press", "overhead-press", "lateral-raise", "triceps-pushdown"], sc, extraCardio ? "ip-atlama" : null),
      buildDay("loA", "Alt Vücut A", "Bacak gücü", ["squat", "leg-press", "leg-curl", "calf-raise"], sc, extraCardio ? "eliptik" : null),
      buildDay("upB", "Üst Vücut B", "Çekiş odaklı", ["deadlift", "pull-up", "seated-row", "biceps-curl"], sc, null),
      buildDay("loB", "Alt Vücut B & Kardiyo", "Bacak + kardiyo", ["lunge", "hip-thrust", "leg-extension"], sc, "kosu"),
    ];
  }
  return [
    buildDay("push", "İtiş (Push)", "Göğüs · Omuz · Arka kol", ["bench-press", "incline-press", "overhead-press", "lateral-raise", "triceps-pushdown"], sc, extraCardio ? "ip-atlama" : null),
    buildDay("pull", "Çekiş (Pull)", "Sırt · Ön kol", ["deadlift", "pull-up", "seated-row", "face-pull", "biceps-curl"], sc, null),
    buildDay("legs", "Bacak (Legs)", "Alt vücut", ["squat", "leg-press", "leg-curl", "lunge", "calf-raise"], sc, extraCardio ? "bisiklet" : null),
    buildDay("shoulder", "Omuz & Karın", "Omuz · Kor", ["overhead-press", "lateral-raise", "front-raise", "leg-raise", "russian-twist"], sc, null),
    buildDay("cardio", "Kardiyo & Kondisyon", "Yağ yakımı", ["hiit", "kurek", "plank"], sc, "kosu"),
  ];
}

/* Günlük beslenme planı — öğün dağılımı */
function buildNutrition(profile) {
  const m = macroTargets(profile);
  const dist = [
    { key: "kahvalti", name: "Kahvaltı", pct: 0.28 },
    { key: "ogle", name: "Öğle Yemeği", pct: 0.34 },
    { key: "aksam", name: "Akşam Yemeği", pct: 0.28 },
    { key: "ara", name: "Ara Öğün", pct: 0.10 },
  ].map((d) => ({ ...d, kcal: Math.round(m.kcal * d.pct) }));
  return { ...m, meals: dist };
}

function tips(profile) {
  const t = [];
  if (profile.goal === "lose") {
    t.push("Kalori açığını koru: hedefin TDEE'nin ~500 kcal altında.");
    t.push("Protein hedefini tuttur; kas kaybını önler.");
    t.push("Haftada en az 2 kardiyo seansı ekle.");
  } else if (profile.goal === "gain") {
    t.push("Hafif kalori fazlası ile temiz kas kütlesi hedefle.");
    t.push("Bileşik hareketlerde progresif aşırı yükleme uygula.");
    t.push("Uyku ve toparlanmaya öncelik ver (7-9 saat).");
  } else {
    t.push("Kaloriyi dengede tut; performansı koru.");
    t.push("Kuvvet ve kardiyoyu dengeli çalış.");
  }
  t.push(`Günde ${Math.max(2, Math.round((profile.weight || 70) * 0.033))} litre su hedefle.`);
  return t;
}

export function generateProgram(profile) {
  const days = daysForActivity(profile.activityLevel);
  const sc = scheme(profile.goal);
  return {
    createdAt: Date.now(),
    daysPerWeek: days,
    goal: profile.goal,
    tdee: Math.round(tdee(profile)),
    split: buildSplit(days, sc, profile.goal),
    nutrition: buildNutrition(profile),
    tips: tips(profile),
  };
}
