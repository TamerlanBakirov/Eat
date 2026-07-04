/* Egzersiz detayları — hedef kaslar (TR), ekipman (TR), adım adım anlatım.
   Kas/ekipman verisi free-exercise-db'den; Türkçeye uyarlandı. 2. görsel /1.jpg. */

const MUSCLE_TR = {
  chest: "Göğüs", triceps: "Arka kol", biceps: "Ön kol", forearms: "Ön kol",
  lats: "Kanat (sırt)", "middle back": "Orta sırt", "lower back": "Bel",
  shoulders: "Omuz", traps: "Trapez", quadriceps: "Ön bacak", hamstrings: "Arka bacak",
  glutes: "Kalça", calves: "Baldır", abdominals: "Karın", neck: "Boyun",
};
const EQUIP_TR = {
  barbell: "Halter", dumbbell: "Dambıl", cable: "Kablo makinesi", machine: "Makine",
  "body only": "Vücut ağırlığı", "e-z curl bar": "EZ bar", kettlebells: "Kettlebell",
  bands: "Direnç bandı", "medicine ball": "Sağlık topu", other: "Diğer", "exercise ball": "Pilates topu",
};

export function muscleTR(m) { return MUSCLE_TR[m] || m; }
export function equipTR(e) { return EQUIP_TR[e] || (e ? e : "Ekipmansız"); }

/* id → { primary, secondary[], equipment, steps[] } (ham İngilizce kas adları; gösterimde çevrilir) */
export const EXERCISE_DETAILS = {
  "bench-press": { primary: "chest", secondary: ["triceps", "shoulders"], equipment: "barbell", steps: [
    "Sırt üstü sehpaya uzan, barı omuz genişliğinden biraz açık tut.",
    "Barı kontrollü şekilde göğsüne indir, dirsekler ~45°.",
    "Göğsüne değince güçlü şekilde yukarı it, üstte dur." ] },
  "incline-press": { primary: "chest", secondary: ["shoulders", "triceps"], equipment: "dumbbell", steps: [
    "Sehpayı 30-45° eğ, dambılları göğüs hizasında tut.",
    "Dambılları yukarı ve içe doğru it, üstte hafif yaklaştır.",
    "Kontrollü indir, göğüs üstünde gerginliği hisset." ] },
  "chest-fly": { primary: "chest", secondary: [], equipment: "dumbbell", steps: [
    "Sırt üstü uzan, dambıllar göğüs üzerinde hafif bükük dirsekle.",
    "Kolları yaylar gibi yana aç, göğüste gerilmeyi hisset.",
    "Göğsü sıkarak dambılları tekrar birleştir." ] },
  "push-up": { primary: "chest", secondary: ["shoulders", "triceps"], equipment: "body only", steps: [
    "Eller omuz genişliğinde, vücut düz bir çizgi.",
    "Dirsekleri bükerek göğsü yere yaklaştır.",
    "Yere değmeden güçlü şekilde yukarı it." ] },
  "dips": { primary: "triceps", secondary: ["chest", "shoulders"], equipment: "body only", steps: [
    "Paralel barlara asıl, kolları düz.",
    "Dirsekleri bükerek gövdeyi indir (~90°).",
    "Triceps ve göğsü sıkarak yukarı it." ] },
  "pull-up": { primary: "lats", secondary: ["biceps", "middle back"], equipment: "body only", steps: [
    "Bara omuz genişliğinden geniş, avuç öne asıl.",
    "Çeneni bar hizasına çekerek kanatları sık.",
    "Kontrollü şekilde tam gerilene kadar in." ] },
  "lat-pulldown": { primary: "lats", secondary: ["biceps", "middle back"], equipment: "cable", steps: [
    "Barı geniş tut, göğsü hafif dışa ver.",
    "Barı göğüs üstüne çek, dirsekleri aşağı-geriye.",
    "Yavaşça başlangıca bırak, kanatlarda gerilme." ] },
  "barbell-row": { primary: "middle back", secondary: ["lats", "biceps"], equipment: "barbell", steps: [
    "Kalçadan öne eğil, sırt düz, bar dizlerin altında.",
    "Barı karın alt bölgesine çek, dirsekler gövdeye yakın.",
    "Kontrollü indir, her tekrarda sırt düz kalsın." ] },
  "seated-row": { primary: "middle back", secondary: ["lats", "biceps"], equipment: "cable", steps: [
    "Otur, dizler hafif bükük, sırt dik.",
    "Tutamağı karına çek, kürek kemiklerini sık.",
    "Yavaşça ileri bırak, gövdeyi sabit tut." ] },
  "deadlift": { primary: "lower back", secondary: ["glutes", "hamstrings", "traps"], equipment: "barbell", steps: [
    "Ayaklar kalça genişliğinde, bar kaval kemiğine yakın.",
    "Sırt düz, kalçadan güç alarak barı yukarı kaldır.",
    "Üstte kalçayı kilitle, kontrollü indir." ] },
  "squat": { primary: "quadriceps", secondary: ["glutes", "hamstrings"], equipment: "barbell", steps: [
    "Bar üst sırtta, ayaklar omuz genişliğinde.",
    "Kalçayı geriye alarak paralel altına çök, sırt düz.",
    "Topuklardan güç alarak yukarı kalk." ] },
  "leg-press": { primary: "quadriceps", secondary: ["glutes", "hamstrings"], equipment: "machine", steps: [
    "Ayaklar platformda omuz genişliğinde.",
    "Dizleri ~90° bükerek ağırlığı indir.",
    "Dizleri kilitlemeden güçlü şekilde it." ] },
  "lunge": { primary: "quadriceps", secondary: ["glutes", "hamstrings"], equipment: "barbell", steps: [
    "Bir adım öne at, arka diz yere yaklaşsın.",
    "Ön diz ayak ucunu geçmesin, gövde dik.",
    "Ön topuktan güç alarak kalk, bacak değiştir." ] },
  "leg-curl": { primary: "hamstrings", secondary: [], equipment: "machine", steps: [
    "Yüzüstü uzan, topuk pedin altında.",
    "Topukları kalçaya doğru bük, arka bacağı sık.",
    "Kontrollü şekilde başlangıca indir." ] },
  "leg-extension": { primary: "quadriceps", secondary: [], equipment: "machine", steps: [
    "Otur, ayak bilekleri pedin arkasında.",
    "Bacakları düz olana kadar kaldır, ön bacağı sık.",
    "Yavaşça indir, gerginliği koru." ] },
  "calf-raise": { primary: "calves", secondary: [], equipment: "machine", steps: [
    "Ayak ucunda dur, topuklar boşta.",
    "Parmak ucuna yükselerek baldırı sık.",
    "Yavaşça in, altta gerilmeyi hisset." ] },
  "hip-thrust": { primary: "glutes", secondary: ["hamstrings"], equipment: "barbell", steps: [
    "Üst sırt sehpada, bar kalça üstünde.",
    "Kalçayı yukarı it, üstte sıkıştır.",
    "Kontrollü indir, kalça hep aktif kalsın." ] },
  "overhead-press": { primary: "shoulders", secondary: ["triceps"], equipment: "barbell", steps: [
    "Bar omuz önünde, ayaklar omuz genişliğinde.",
    "Barı baş üstüne it, gövdeyi sabit tut.",
    "Kontrollü şekilde omuza indir." ] },
  "lateral-raise": { primary: "shoulders", secondary: [], equipment: "dumbbell", steps: [
    "Dambıllar yanda, dirsek hafif bükük.",
    "Kolları omuz hizasına kadar yana kaldır.",
    "Yavaşça indir, salınım yapma." ] },
  "front-raise": { primary: "shoulders", secondary: [], equipment: "dumbbell", steps: [
    "Dambıllar önde, avuçlar aşağı.",
    "Kolu omuz hizasına kadar öne kaldır.",
    "Kontrollü indir, gövde sabit." ] },
  "face-pull": { primary: "shoulders", secondary: ["middle back"], equipment: "cable", steps: [
    "Halatı yüz hizasında tut, dirsekler yüksek.",
    "Halatı yüze doğru çek, kürekleri sık.",
    "Yavaşça ileri bırak." ] },
  "shrug": { primary: "traps", secondary: [], equipment: "barbell", steps: [
    "Bar/dambıl elde, kollar düz.",
    "Omuzları kulağa doğru yukarı çek.",
    "Üstte sık, kontrollü indir." ] },
  "biceps-curl": { primary: "biceps", secondary: ["forearms"], equipment: "dumbbell", steps: [
    "Dambıllar yanda, avuçlar öne.",
    "Dirsekten bükerek yukarı kaldır, biceps sık.",
    "Yavaşça indir, dirsek sabit." ] },
  "hammer-curl": { primary: "biceps", secondary: [], equipment: "dumbbell", steps: [
    "Dambıllar yanda, avuçlar birbirine bakar.",
    "Nötr tutuşla yukarı bük.",
    "Kontrollü indir." ] },
  "triceps-pushdown": { primary: "triceps", secondary: [], equipment: "cable", steps: [
    "Barı göğüs hizasında tut, dirsekler gövdede.",
    "Barı aşağı it, kolları tam düzelt.",
    "Yavaşça yukarı bırak, dirsek sabit." ] },
  "skull-crusher": { primary: "triceps", secondary: ["forearms"], equipment: "e-z curl bar", steps: [
    "Sırt üstü uzan, bar alın üzerinde.",
    "Dirsekten bükerek barı alına indir.",
    "Triceps ile yukarı düzelt, dirsek sabit." ] },
  "crunch": { primary: "abdominals", secondary: [], equipment: "body only", steps: [
    "Sırt üstü, dizler bükük, eller başta.",
    "Üst gövdeyi karından kıvırarak kaldır.",
    "Yavaşça indir, boyun rahat." ] },
  "plank": { primary: "abdominals", secondary: [], equipment: "body only", steps: [
    "Ön kol ve ayak ucunda dur.",
    "Vücut düz bir çizgi, karnı sık.",
    "Nefes alarak pozisyonu koru (süre)." ] },
  "leg-raise": { primary: "abdominals", secondary: [], equipment: "body only", steps: [
    "Sırt üstü/asılı, bacaklar düz.",
    "Bacakları 90°'ye kadar kaldır, karnı sık.",
    "Kontrollü indir, sallanma yapma." ] },
  "russian-twist": { primary: "abdominals", secondary: ["lower back"], equipment: "body only", steps: [
    "Otur, gövde hafif geride, ayaklar havada.",
    "Gövdeyi sağa-sola döndür, karnı sık.",
    "Kontrollü ve ritmik hareket et." ] },
  "kosu": { primary: "quadriceps", secondary: ["calves", "glutes"], equipment: "machine", steps: [
    "Isınmayla başla, tempoyu kademeli artır.",
    "Dik postür, kolları ritmik salla.",
    "Hedef süre boyunca sabit tempoyu koru." ] },
  "yuruyus": { primary: "quadriceps", secondary: ["calves", "glutes"], equipment: "machine", steps: [
    "Dik dur, adımları doğal at.",
    "Orta-hızlı tempoda nefesini kontrol et.",
    "Hedef süreyi tamamla." ] },
  "bisiklet": { primary: "quadriceps", secondary: ["calves", "hamstrings"], equipment: "machine", steps: [
    "Sele yüksekliğini ayarla, sırt rahat.",
    "Düzenli pedal çevir, direnci ihtiyaca göre ayarla.",
    "Hedef süre boyunca tempoyu koru." ] },
  "ip-atlama": { primary: "quadriceps", secondary: ["calves"], equipment: "other", steps: [
    "İpi bilekle çevir, alçak zıpla.",
    "Ayak ucunda hafif sıçra.",
    "Ritmi koru, molalarla devam et." ] },
  "eliptik": { primary: "quadriceps", secondary: ["glutes", "hamstrings"], equipment: "machine", steps: [
    "Pedallara bas, kolları da kullan.",
    "Akıcı, salınımsız hareket et.",
    "Hedef süre boyunca tempoyu koru." ] },
  "merdiven": { primary: "quadriceps", secondary: ["glutes", "calves"], equipment: "machine", steps: [
    "Dik dur, tırabzana yaslanma.",
    "Düzenli adımlarla tırman.",
    "Tempoyu koru, hedef süreyi tamamla." ] },
  "kurek": { primary: "quadriceps", secondary: ["middle back", "hamstrings"], equipment: "machine", steps: [
    "İtişi bacaktan başlat, sonra gövde-kol.",
    "Dönüşte kol-gövde-bacak sırasıyla gevşe.",
    "Ritmik ve güçlü çek." ] },
  "hiit": { primary: "quadriceps", secondary: ["chest", "shoulders"], equipment: "other", steps: [
    "Yüksek tempo (20-40 sn) + kısa dinlenme döngüsü.",
    "Hareketleri maksimum efora yakın yap.",
    "Setleri hedef süre boyunca tekrarla." ] },
  "yoga": { primary: "lower back", secondary: ["glutes", "middle back"], equipment: "other", steps: [
    "Pozisyona yavaşça gir, nefesle derinleş.",
    "Gerilmeyi zorlamadan hisset.",
    "Her pozda birkaç nefes kal." ] },
};

/* 2. görsel URL'si (0.jpg → 1.jpg) */
export function secondImage(img) {
  return img && img.endsWith("/0.jpg") ? img.replace("/0.jpg", "/1.jpg") : null;
}
