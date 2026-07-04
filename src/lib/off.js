/* OpenFoodFacts barkod arama — ücretsiz, anahtarsız. 100 g başına besin değeri döner. */
const API = "https://world.openfoodfacts.org/api/v2/product/";

function num(v) {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export async function lookupBarcode(code) {
  let res;
  try {
    res = await fetch(`${API}${encodeURIComponent(code)}.json?fields=product_name,product_name_tr,brands,nutriments,serving_quantity`);
  } catch {
    throw new Error("Ağ hatası — internet bağlantını kontrol et.");
  }
  if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);
  const data = await res.json();
  if (data.status === 0 || !data.product) throw new Error("Bu barkod veritabanında bulunamadı.");

  const p = data.product;
  const n = p.nutriments || {};
  const kcal100 = num(n["energy-kcal_100g"]) || Math.round(num(n["energy_100g"]) / 4.184);
  const name = (p.product_name_tr || p.product_name || "").trim() || (p.brands ? p.brands.split(",")[0] : "Ürün");
  return {
    name,
    brand: p.brands ? p.brands.split(",")[0].trim() : "",
    per100: {
      kcal: Math.round(kcal100),
      p: Math.round(num(n["proteins_100g"]) * 10) / 10,
      c: Math.round(num(n["carbohydrates_100g"]) * 10) / 10,
      f: Math.round(num(n["fat_100g"]) * 10) / 10,
    },
    serving: num(p.serving_quantity) || 0,
  };
}
