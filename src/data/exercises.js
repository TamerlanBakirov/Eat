/* Egzersiz görselleri — free-exercise-db (CC0 lisans, github.com/yuhonas/free-exercise-db).
   Uzaktan yüklenir; yüklenemezse arayüzde kas grubu ikonuna düşer. */
export const EXERCISE_IMAGES = {
  "bench-press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Press_-_Powerlifting/0.jpg",
  "incline-press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
  "chest-fly": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
  "push-up": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
  "dips": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Triceps_Version/0.jpg",
  "pull-up": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
  "lat-pulldown": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
  "barbell-row": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
  "seated-row": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
  "deadlift": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Deadlift/0.jpg",
  "squat": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
  "leg-press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
  "lunge": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
  "leg-curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
  "leg-extension": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg",
  "calf-raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
  "hip-thrust": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Hip_Thrust/0.jpg",
  "overhead-press": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
  "lateral-raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
  "front-raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
  "face-pull": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
  "shrug": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg",
  "biceps-curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
  "hammer-curl": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
  "triceps-pushdown": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
  "skull-crusher": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/EZ-Bar_Skullcrusher/0.jpg",
  "crunch": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Crunches/0.jpg",
  "plank": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
  "leg-raise": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
  "russian-twist": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
  "kosu": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Running_Treadmill/0.jpg",
  "yuruyus": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Walking_Treadmill/0.jpg",
  "bisiklet": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bicycling_Stationary/0.jpg",
  "yuzme": null,
  "ip-atlama": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rope_Jumping/0.jpg",
  "eliptik": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Elliptical_Trainer/0.jpg",
  "merdiven": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stairmaster/0.jpg",
  "kurek": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Rowing_Stationary/0.jpg",
  "hiit": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Mountain_Climbers/0.jpg",
  "yoga": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Childs_Pose/0.jpg",
};

/* Egzersiz veritabanı.
   met: Metabolik eşdeğer — kalori hesabında kullanılır (kcal = MET × kg × saat).
   type: "strength" (set/tekrar/ağırlık) veya "cardio" (süre)
   img: görsel — EXERCISE_IMAGES'ten otomatik eklenir. */
const EXERCISE_DB_RAW = [
  // Göğüs
  { id: "bench-press", name: "Bench Press", cat: "Göğüs", type: "strength", met: 5 },
  { id: "incline-press", name: "Incline Dumbbell Press", cat: "Göğüs", type: "strength", met: 5 },
  { id: "chest-fly", name: "Chest Fly (Kelebek)", cat: "Göğüs", type: "strength", met: 4 },
  { id: "push-up", name: "Şınav", cat: "Göğüs", type: "strength", met: 6 },
  { id: "dips", name: "Dips (Paralel Bar)", cat: "Göğüs", type: "strength", met: 5.5 },

  // Sırt
  { id: "pull-up", name: "Barfiks", cat: "Sırt", type: "strength", met: 6 },
  { id: "lat-pulldown", name: "Lat Pulldown", cat: "Sırt", type: "strength", met: 4.5 },
  { id: "barbell-row", name: "Barbell Row", cat: "Sırt", type: "strength", met: 5.5 },
  { id: "seated-row", name: "Seated Cable Row", cat: "Sırt", type: "strength", met: 4.5 },
  { id: "deadlift", name: "Deadlift", cat: "Sırt", type: "strength", met: 6.5 },

  // Bacak
  { id: "squat", name: "Squat", cat: "Bacak", type: "strength", met: 6 },
  { id: "leg-press", name: "Leg Press", cat: "Bacak", type: "strength", met: 5 },
  { id: "lunge", name: "Lunge", cat: "Bacak", type: "strength", met: 5.5 },
  { id: "leg-curl", name: "Leg Curl", cat: "Bacak", type: "strength", met: 4 },
  { id: "leg-extension", name: "Leg Extension", cat: "Bacak", type: "strength", met: 4 },
  { id: "calf-raise", name: "Calf Raise", cat: "Bacak", type: "strength", met: 3.5 },
  { id: "hip-thrust", name: "Hip Thrust", cat: "Bacak", type: "strength", met: 5 },

  // Omuz
  { id: "overhead-press", name: "Overhead Press", cat: "Omuz", type: "strength", met: 5 },
  { id: "lateral-raise", name: "Lateral Raise", cat: "Omuz", type: "strength", met: 3.5 },
  { id: "front-raise", name: "Front Raise", cat: "Omuz", type: "strength", met: 3.5 },
  { id: "face-pull", name: "Face Pull", cat: "Omuz", type: "strength", met: 3.5 },
  { id: "shrug", name: "Shrug", cat: "Omuz", type: "strength", met: 3.5 },

  // Kol
  { id: "biceps-curl", name: "Biceps Curl", cat: "Kol", type: "strength", met: 3.5 },
  { id: "hammer-curl", name: "Hammer Curl", cat: "Kol", type: "strength", met: 3.5 },
  { id: "triceps-pushdown", name: "Triceps Pushdown", cat: "Kol", type: "strength", met: 3.5 },
  { id: "skull-crusher", name: "Skull Crusher", cat: "Kol", type: "strength", met: 3.5 },

  // Karın
  { id: "crunch", name: "Mekik", cat: "Karın", type: "strength", met: 4 },
  { id: "plank", name: "Plank", cat: "Karın", type: "cardio", met: 3.5 },
  { id: "leg-raise", name: "Leg Raise", cat: "Karın", type: "strength", met: 4 },
  { id: "russian-twist", name: "Russian Twist", cat: "Karın", type: "strength", met: 4 },

  // Kardiyo
  { id: "kosu", name: "Koşu (orta tempo)", cat: "Kardiyo", type: "cardio", met: 9.8 },
  { id: "yuruyus", name: "Tempolu Yürüyüş", cat: "Kardiyo", type: "cardio", met: 4.3 },
  { id: "bisiklet", name: "Bisiklet", cat: "Kardiyo", type: "cardio", met: 7.5 },
  { id: "yuzme", name: "Yüzme", cat: "Kardiyo", type: "cardio", met: 8 },
  { id: "ip-atlama", name: "İp Atlama", cat: "Kardiyo", type: "cardio", met: 11 },
  { id: "eliptik", name: "Eliptik Bisiklet", cat: "Kardiyo", type: "cardio", met: 5.5 },
  { id: "merdiven", name: "Merdiven Tırmanışı (StairMaster)", cat: "Kardiyo", type: "cardio", met: 9 },
  { id: "kurek", name: "Kürek (Rowing)", cat: "Kardiyo", type: "cardio", met: 7 },
  { id: "hiit", name: "HIIT Antrenmanı", cat: "Kardiyo", type: "cardio", met: 10 },
  { id: "yoga", name: "Yoga", cat: "Kardiyo", type: "cardio", met: 3 },
];

/* Her egzersize görselini ekle */
export const EXERCISE_DB = EXERCISE_DB_RAW.map((e) => ({ ...e, img: EXERCISE_IMAGES[e.id] || null }));

/* Hazır antrenman programı şablonları */
export const PROGRAM_TEMPLATES = [
  {
    id: "full-body",
    name: "Tüm Vücut (Başlangıç)",
    desc: "Haftada 3 gün için ideal, temel hareketlerden oluşan program.",
    exercises: [
      { exerciseId: "squat", sets: 3, reps: 10 },
      { exerciseId: "bench-press", sets: 3, reps: 10 },
      { exerciseId: "barbell-row", sets: 3, reps: 10 },
      { exerciseId: "overhead-press", sets: 3, reps: 10 },
      { exerciseId: "plank", sets: 3, reps: 0 },
    ],
  },
  {
    id: "push",
    name: "İtiş Günü (Push)",
    desc: "Göğüs, omuz ve arka kol odaklı itiş antrenmanı.",
    exercises: [
      { exerciseId: "bench-press", sets: 4, reps: 8 },
      { exerciseId: "incline-press", sets: 3, reps: 10 },
      { exerciseId: "overhead-press", sets: 3, reps: 10 },
      { exerciseId: "lateral-raise", sets: 3, reps: 12 },
      { exerciseId: "triceps-pushdown", sets: 3, reps: 12 },
    ],
  },
  {
    id: "pull",
    name: "Çekiş Günü (Pull)",
    desc: "Sırt ve ön kol odaklı çekiş antrenmanı.",
    exercises: [
      { exerciseId: "deadlift", sets: 3, reps: 6 },
      { exerciseId: "pull-up", sets: 3, reps: 8 },
      { exerciseId: "seated-row", sets: 3, reps: 10 },
      { exerciseId: "face-pull", sets: 3, reps: 15 },
      { exerciseId: "biceps-curl", sets: 3, reps: 12 },
    ],
  },
  {
    id: "legs",
    name: "Bacak Günü (Legs)",
    desc: "Alt vücut kuvvet ve hacim antrenmanı.",
    exercises: [
      { exerciseId: "squat", sets: 4, reps: 8 },
      { exerciseId: "leg-press", sets: 3, reps: 10 },
      { exerciseId: "leg-curl", sets: 3, reps: 12 },
      { exerciseId: "lunge", sets: 3, reps: 10 },
      { exerciseId: "calf-raise", sets: 4, reps: 15 },
    ],
  },
  {
    id: "cardio-mix",
    name: "Kardiyo & Kondisyon",
    desc: "Yağ yakımı ve dayanıklılık için karma kardiyo seansı.",
    exercises: [
      { exerciseId: "kosu", sets: 1, reps: 0, duration: 20 },
      { exerciseId: "ip-atlama", sets: 1, reps: 0, duration: 10 },
      { exerciseId: "plank", sets: 3, reps: 0, duration: 2 },
    ],
  },
];
