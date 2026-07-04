/* Küratörlü tarif kütüphanesi — porsiyon başına besin değeri + öğün etiketi.
   meals: hangi öğüne uygun. Menü planlayıcı bunlardan günlük plan kurar. */
export const RECIPES = [
  { id: "r1", name: "Yulaf Ezmesi & Muz", meals: ["kahvalti"], kcal: 350, p: 12, c: 58, f: 8,
    ingredients: ["60g yulaf", "1 muz", "200ml süt", "1 tk bal"] },
  { id: "r2", name: "Menemen & Tam Buğday Ekmek", meals: ["kahvalti"], kcal: 400, p: 20, c: 30, f: 22,
    ingredients: ["3 yumurta", "2 domates", "1 biber", "1 dilim ekmek"] },
  { id: "r3", name: "Yumurta Beyazı Omlet & Peynir", meals: ["kahvalti"], kcal: 260, p: 30, c: 6, f: 12,
    ingredients: ["4 yumurta beyazı", "1 yumurta", "30g light peynir"] },
  { id: "r4", name: "Yoğurt & Meyve & Granola", meals: ["kahvalti", "ara"], kcal: 300, p: 18, c: 40, f: 8,
    ingredients: ["200g yoğurt", "1 avuç yaban mersini", "40g granola"] },

  { id: "r5", name: "Izgara Tavuk & Bulgur Pilavı", meals: ["ogle", "aksam"], kcal: 520, p: 45, c: 55, f: 12,
    ingredients: ["150g tavuk göğsü", "80g bulgur", "salata"] },
  { id: "r6", name: "Ton Balıklı Salata", meals: ["ogle"], kcal: 380, p: 32, c: 20, f: 18,
    ingredients: ["1 kutu ton", "yeşillik", "1 yumurta", "zeytinyağı"] },
  { id: "r7", name: "Mercimek Çorbası & Ekmek", meals: ["ogle", "aksam"], kcal: 340, p: 18, c: 50, f: 7,
    ingredients: ["1 kase mercimek çorbası", "1 dilim tam buğday ekmek"] },
  { id: "r8", name: "Köfte & Fırın Sebze", meals: ["aksam"], kcal: 560, p: 38, c: 35, f: 28,
    ingredients: ["150g köfte", "fırın sebze", "yoğurt"] },
  { id: "r9", name: "Somon & Kinoa", meals: ["ogle", "aksam"], kcal: 540, p: 40, c: 40, f: 22,
    ingredients: ["150g somon", "80g kinoa", "brokoli"] },
  { id: "r10", name: "Tavuklu Wrap", meals: ["ogle"], kcal: 480, p: 38, c: 45, f: 15,
    ingredients: ["150g tavuk", "1 lavaş", "yeşillik", "yoğurt sos"] },
  { id: "r11", name: "Kıymalı Sebze Sote & Pirinç", meals: ["aksam"], kcal: 600, p: 40, c: 60, f: 20,
    ingredients: ["150g kıyma", "sebze", "80g pirinç"] },

  { id: "r12", name: "Protein Bar", meals: ["ara"], kcal: 200, p: 20, c: 20, f: 6,
    ingredients: ["1 protein bar"] },
  { id: "r13", name: "Badem & Kuru Meyve", meals: ["ara"], kcal: 180, p: 6, c: 15, f: 12,
    ingredients: ["20g badem", "2 kuru kayısı"] },
  { id: "r14", name: "Protein Shake & Muz", meals: ["ara", "kahvalti"], kcal: 280, p: 30, c: 30, f: 4,
    ingredients: ["1 ölçek whey", "1 muz", "300ml su/süt"] },
  { id: "r15", name: "Peynir & Tam Buğday Kraker", meals: ["ara"], kcal: 220, p: 12, c: 20, f: 11,
    ingredients: ["40g peynir", "4 kraker"] },
];

/* Öğün kalori hedefine en yakın tarifi seç (aynı olanları çeşitle) */
export function planDay(mealBudgets) {
  const used = new Set();
  return mealBudgets.map(({ key, name, kcal }) => {
    const candidates = RECIPES.filter((r) => r.meals.includes(key));
    let best = null, bestScore = Infinity;
    for (const r of candidates) {
      const score = Math.abs(r.kcal - kcal) + (used.has(r.id) ? 500 : 0);
      if (score < bestScore) { bestScore = score; best = r; }
    }
    if (best) used.add(best.id);
    return { key, name, target: kcal, recipe: best };
  });
}
