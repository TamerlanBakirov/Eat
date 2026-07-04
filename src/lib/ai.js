/* Fotoğraftan yemek kalori/makro tahmini — OpenAI GPT-4o görsel modeli.
   API anahtarı ayarlarda saklanır (AsyncStorage). Anahtar yalnızca cihazda kalır. */

const ENDPOINT = "https://api.openai.com/v1/chat/completions";

const SYSTEM = `Sen bir beslenme uzmanısın. Verilen yemek fotoğrafını analiz et.
SADECE geçerli JSON döndür, başka metin yok. Şema:
{"name": string (Türkçe yemek adı), "grams": number (tahmini toplam porsiyon gramı), "kcal": number, "protein": number (g), "carb": number (g), "fat": number (g), "confidence": "low"|"medium"|"high"}
Değerler fotoğraftaki porsiyonun TAMAMI içindir. Yemek tespit edilemezse kcal 0 ver.`;

function extractJson(text) {
  if (!text) throw new Error("Boş yanıt");
  // ```json ... ``` bloklarını temizle
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON bulunamadı");
  return JSON.parse(raw.slice(start, end + 1));
}

/* AI beslenme koçu — profil + günlük duruma göre kısa, uygulanabilir öneri.
   history: [{role:"user"|"assistant", content}], context: metin özet. */
export async function nutritionCoach({ apiKey, context, history }) {
  if (!apiKey) throw new Error("API anahtarı yok. Profil > Yapay Zekâ bölümünden ekle.");
  const system = `Sen deneyimli bir beslenme ve fitness koçusun. Türkçe, kısa ve uygulanabilir öneriler ver.
Kullanıcının güncel durumu:
${context}
Kurallar: Somut yemek/porsiyon öner, gram ve yaklaşık kalori belirt. Madde işaretleri kullan. En fazla 6-7 satır. Tıbbi iddialardan kaçın.`;
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 500,
        temperature: 0.6,
        messages: [{ role: "system", content: system }, ...history],
      }),
    });
  } catch {
    throw new Error("Ağ hatası — internet bağlantını kontrol et.");
  }
  if (!res.ok) {
    if (res.status === 401) throw new Error("API anahtarı geçersiz.");
    throw new Error(`OpenAI hatası (${res.status})`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "Yanıt alınamadı.";
}

/* base64: veri şeması olmadan saf base64; mime: "image/jpeg" varsayılan */
export async function estimateFoodFromImage({ base64, apiKey, mime = "image/jpeg" }) {
  if (!apiKey) throw new Error("API anahtarı yok. Profil > Yapay Zekâ bölümünden ekle.");
  if (!base64) throw new Error("Görsel verisi yok.");

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 500,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Bu yemeğin besin değerlerini tahmin et." },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}`, detail: "low" } },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    throw new Error("Ağ hatası — internet bağlantını kontrol et.");
  }

  if (!res.ok) {
    let msg = `OpenAI hatası (${res.status})`;
    try {
      const err = await res.json();
      if (err?.error?.message) msg = err.error.message;
    } catch {}
    if (res.status === 401) msg = "API anahtarı geçersiz.";
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  const j = extractJson(text);

  const num = (v) => {
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };
  return {
    name: (j.name && String(j.name).trim()) || "Yemek",
    grams: Math.round(num(j.grams)) || 100,
    kcal: Math.round(num(j.kcal)),
    p: Math.round(num(j.protein) * 10) / 10,
    c: Math.round(num(j.carb) * 10) / 10,
    f: Math.round(num(j.fat) * 10) / 10,
    confidence: j.confidence || "medium",
  };
}
