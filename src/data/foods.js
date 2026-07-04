/* Besin veritabanı — değerler 100 g başınadır.
   kcal: kalori, p: protein (g), c: karbonhidrat (g), f: yağ (g) */
export const FOOD_DB = [
  // Kahvaltılık
  { id: "yumurta", name: "Yumurta (haşlanmış)", cat: "Kahvaltılık", kcal: 155, p: 13, c: 1.1, f: 11 },
  { id: "beyaz-peynir", name: "Beyaz Peynir", cat: "Kahvaltılık", kcal: 264, p: 14, c: 4.1, f: 21 },
  { id: "kasar", name: "Kaşar Peyniri", cat: "Kahvaltılık", kcal: 404, p: 25, c: 1.4, f: 33 },
  { id: "zeytin", name: "Zeytin (siyah)", cat: "Kahvaltılık", kcal: 115, p: 0.8, c: 6, f: 11 },
  { id: "bal", name: "Bal", cat: "Kahvaltılık", kcal: 304, p: 0.3, c: 82, f: 0 },
  { id: "tereyagi", name: "Tereyağı", cat: "Kahvaltılık", kcal: 717, p: 0.9, c: 0.1, f: 81 },
  { id: "sucuk", name: "Sucuk", cat: "Kahvaltılık", kcal: 452, p: 20, c: 2, f: 40 },
  { id: "menemen", name: "Menemen", cat: "Kahvaltılık", kcal: 120, p: 6, c: 5, f: 8.5 },

  // Ekmek & Tahıl
  { id: "ekmek", name: "Ekmek (beyaz)", cat: "Tahıl", kcal: 265, p: 9, c: 49, f: 3.2 },
  { id: "tam-bugday", name: "Tam Buğday Ekmeği", cat: "Tahıl", kcal: 247, p: 13, c: 41, f: 3.4 },
  { id: "yulaf", name: "Yulaf Ezmesi", cat: "Tahıl", kcal: 389, p: 17, c: 66, f: 6.9 },
  { id: "pirinc-pilavi", name: "Pirinç Pilavı", cat: "Tahıl", kcal: 175, p: 3.2, c: 30, f: 4.4 },
  { id: "bulgur-pilavi", name: "Bulgur Pilavı", cat: "Tahıl", kcal: 120, p: 3.5, c: 22, f: 2 },
  { id: "makarna", name: "Makarna (haşlanmış)", cat: "Tahıl", kcal: 158, p: 5.8, c: 31, f: 0.9 },
  { id: "simit", name: "Simit (1 adet ~110 g)", cat: "Tahıl", kcal: 300, p: 9.5, c: 55, f: 4.5 },

  // Et & Tavuk & Balık
  { id: "tavuk-gogsu", name: "Tavuk Göğsü (ızgara)", cat: "Protein", kcal: 165, p: 31, c: 0, f: 3.6 },
  { id: "tavuk-but", name: "Tavuk But", cat: "Protein", kcal: 209, p: 26, c: 0, f: 11 },
  { id: "dana-kiyma", name: "Dana Kıyma (orta yağlı)", cat: "Protein", kcal: 250, p: 26, c: 0, f: 15 },
  { id: "dana-bonfile", name: "Dana Bonfile", cat: "Protein", kcal: 195, p: 28, c: 0, f: 8.5 },
  { id: "kofte", name: "Izgara Köfte", cat: "Protein", kcal: 245, p: 21, c: 4, f: 16 },
  { id: "somon", name: "Somon (ızgara)", cat: "Protein", kcal: 208, p: 20, c: 0, f: 13 },
  { id: "levrek", name: "Levrek (ızgara)", cat: "Protein", kcal: 124, p: 24, c: 0, f: 2.5 },
  { id: "ton-baligi", name: "Ton Balığı (suda)", cat: "Protein", kcal: 116, p: 26, c: 0, f: 0.8 },
  { id: "hindi", name: "Hindi Göğsü", cat: "Protein", kcal: 135, p: 30, c: 0, f: 1 },

  // Baklagil
  { id: "mercimek-corbasi", name: "Mercimek Çorbası", cat: "Baklagil", kcal: 65, p: 3.7, c: 10, f: 1.2 },
  { id: "kuru-fasulye", name: "Kuru Fasulye (pişmiş)", cat: "Baklagil", kcal: 140, p: 8.7, c: 22, f: 2.5 },
  { id: "nohut", name: "Nohut (pişmiş)", cat: "Baklagil", kcal: 164, p: 8.9, c: 27, f: 2.6 },
  { id: "mercimek", name: "Yeşil Mercimek (pişmiş)", cat: "Baklagil", kcal: 116, p: 9, c: 20, f: 0.4 },

  // Süt ürünleri
  { id: "yogurt", name: "Yoğurt (tam yağlı)", cat: "Süt Ürünü", kcal: 61, p: 3.5, c: 4.7, f: 3.3 },
  { id: "ayran", name: "Ayran", cat: "Süt Ürünü", kcal: 38, p: 1.7, c: 2.4, f: 2.2 },
  { id: "sut", name: "Süt (yarım yağlı)", cat: "Süt Ürünü", kcal: 50, p: 3.4, c: 4.8, f: 1.5 },
  { id: "lor", name: "Lor Peyniri", cat: "Süt Ürünü", kcal: 98, p: 11, c: 3.4, f: 4.3 },
  { id: "kefir", name: "Kefir", cat: "Süt Ürünü", kcal: 55, p: 3.3, c: 4.5, f: 2.5 },

  // Sebze
  { id: "domates", name: "Domates", cat: "Sebze", kcal: 18, p: 0.9, c: 3.9, f: 0.2 },
  { id: "salatalik", name: "Salatalık", cat: "Sebze", kcal: 15, p: 0.7, c: 3.6, f: 0.1 },
  { id: "brokoli", name: "Brokoli (haşlanmış)", cat: "Sebze", kcal: 35, p: 2.4, c: 7.2, f: 0.4 },
  { id: "ispanak", name: "Ispanak (pişmiş)", cat: "Sebze", kcal: 23, p: 3, c: 3.8, f: 0.3 },
  { id: "patates", name: "Patates (haşlanmış)", cat: "Sebze", kcal: 87, p: 1.9, c: 20, f: 0.1 },
  { id: "havuc", name: "Havuç", cat: "Sebze", kcal: 41, p: 0.9, c: 10, f: 0.2 },
  { id: "salata", name: "Mevsim Salatası (yağsız)", cat: "Sebze", kcal: 20, p: 1, c: 4, f: 0.2 },
  { id: "zeytinyagli-fasulye", name: "Zeytinyağlı Taze Fasulye", cat: "Sebze", kcal: 80, p: 2, c: 8, f: 5 },

  // Meyve
  { id: "elma", name: "Elma", cat: "Meyve", kcal: 52, p: 0.3, c: 14, f: 0.2 },
  { id: "muz", name: "Muz", cat: "Meyve", kcal: 89, p: 1.1, c: 23, f: 0.3 },
  { id: "portakal", name: "Portakal", cat: "Meyve", kcal: 47, p: 0.9, c: 12, f: 0.1 },
  { id: "cilek", name: "Çilek", cat: "Meyve", kcal: 32, p: 0.7, c: 7.7, f: 0.3 },
  { id: "uzum", name: "Üzüm", cat: "Meyve", kcal: 69, p: 0.7, c: 18, f: 0.2 },
  { id: "karpuz", name: "Karpuz", cat: "Meyve", kcal: 30, p: 0.6, c: 8, f: 0.2 },
  { id: "avokado", name: "Avokado", cat: "Meyve", kcal: 160, p: 2, c: 8.5, f: 15 },

  // Kuruyemiş
  { id: "badem", name: "Badem", cat: "Kuruyemiş", kcal: 579, p: 21, c: 22, f: 50 },
  { id: "ceviz", name: "Ceviz", cat: "Kuruyemiş", kcal: 654, p: 15, c: 14, f: 65 },
  { id: "findik", name: "Fındık", cat: "Kuruyemiş", kcal: 628, p: 15, c: 17, f: 61 },
  { id: "fistik-ezmesi", name: "Fıstık Ezmesi", cat: "Kuruyemiş", kcal: 588, p: 25, c: 20, f: 50 },

  // İçecek & Atıştırmalık
  { id: "cay", name: "Çay (şekersiz)", cat: "İçecek", kcal: 1, p: 0, c: 0.3, f: 0 },
  { id: "turk-kahvesi", name: "Türk Kahvesi (şekersiz)", cat: "İçecek", kcal: 5, p: 0.3, c: 0.6, f: 0.1 },
  { id: "kola", name: "Kola", cat: "İçecek", kcal: 42, p: 0, c: 10.6, f: 0 },
  { id: "meyve-suyu", name: "Meyve Suyu (portakal)", cat: "İçecek", kcal: 45, p: 0.7, c: 10, f: 0.2 },
  { id: "cikolata", name: "Sütlü Çikolata", cat: "Atıştırmalık", kcal: 535, p: 7.7, c: 59, f: 30 },
  { id: "baklava", name: "Baklava", cat: "Atıştırmalık", kcal: 428, p: 6, c: 51, f: 22 },
  { id: "sutlac", name: "Sütlaç", cat: "Atıştırmalık", kcal: 143, p: 3.5, c: 25, f: 3.2 },
  { id: "protein-tozu", name: "Whey Protein Tozu", cat: "Takviye", kcal: 400, p: 80, c: 8, f: 6 },
  { id: "protein-bar", name: "Protein Bar", cat: "Takviye", kcal: 380, p: 33, c: 38, f: 12 },
];
