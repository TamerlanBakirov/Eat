/* Egzersiz veritabanı.
   met: Metabolik eşdeğer — kalori hesabında kullanılır (kcal = MET × kg × saat).
   type: "strength" (set/tekrar/ağırlık) veya "cardio" (süre/mesafe) */
window.EXERCISE_DB = [
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

/* Hazır antrenman programı şablonları */
window.PROGRAM_TEMPLATES = [
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
