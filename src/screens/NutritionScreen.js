/* Beslenme ekranı: öğün günlüğü, besin arama/ekleme, özel besin oluşturma */
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, FlatList, StyleSheet, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useData, useDate, getDay, nutritionTotals, allFoods } from "../lib/store";
import { macroTargets, fmt, round, parseNum, currentMealKey, MEAL_NAMES, timeStamp } from "../lib/utils";
import { estimateFoodFromImage, nutritionCoach } from "../lib/ai";
import {
  Card, CardTitle, Btn, IconBtn, ProgressBar, EmptyNote, Badge,
  Label, Input, Sheet, useTheme, s,
} from "../components/ui";
import { Segmented } from "../components/ios";
import { Icon } from "../components/icons";
import BarcodeScannerSheet from "../components/BarcodeScannerSheet";
import MenuPlannerSheet from "../components/MenuPlannerSheet";
import { radius, tnum } from "../theme";
import DateHeader from "../components/DateHeader";

const MEALS = [
  { key: "kahvalti", name: "Kahvaltı", icon: "sun", tone: "accent" },
  { key: "ogle", name: "Öğle Yemeği", icon: "nutrition", tone: "success" },
  { key: "aksam", name: "Akşam Yemeği", icon: "moon", tone: "primary" },
  { key: "ara", name: "Ara Öğün", icon: "flame", tone: "warning" },
];

export default function NutritionScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [addMeal, setAddMeal] = useState(null); // besin ekleme sheet'i açık olan öğün
  const [customOpen, setCustomOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const day = getDay(state, dateKey);
  const totals = nutritionTotals(state, dateKey);
  const targets = macroTargets(state.profile);
  const kcalRatio = targets.kcal > 0 ? totals.kcal / targets.kcal : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <DateHeader title="Beslenme" />

        <Card>
          <CardTitle icon="nutrition" right={
            <Text style={{ color: c.muted, fontSize: 13, fontWeight: "600", ...tnum }}>
              {fmt(totals.kcal)} / {fmt(targets.kcal)} kcal
            </Text>
          }>
            Günlük Toplam
          </CardTitle>
          <ProgressBar ratio={kcalRatio} color={c.success} height={12} />
          <View style={[s.row, { gap: 14, marginTop: 10, flexWrap: "wrap" }]}>
            <Text style={{ color: c.muted, fontSize: 12 }}>Protein: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.p, 1)} g</Text></Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>Karb: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.c, 1)} g</Text></Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>Yağ: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.f, 1)} g</Text></Text>
          </View>
        </Card>

        {/* AI hızlı ekleme — fotoğraftan otomatik kalori */}
        <Pressable
          onPress={() => setPhotoOpen(true)}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 14,
            backgroundColor: c.primary, borderRadius: radius.lg, padding: 16, marginBottom: 14,
            opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }],
          })}
        >
          <View style={{ width: 46, height: 46, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="nutrition" size={24} color={c.onPrimary} strokeWidth={2.3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.onPrimary, fontSize: 16, fontWeight: "800", letterSpacing: -0.2 }}>Fotoğrafla Ekle</Text>
            <Text style={{ color: c.onPrimary, opacity: 0.85, fontSize: 12.5, marginTop: 1 }}>Yemeği çek, AI kalorisini hesaplasın</Text>
          </View>
          <Icon name="chevronRight" size={20} color={c.onPrimary} strokeWidth={2.4} />
        </Pressable>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
          <Btn title="Barkod" icon="plus" small kind="ghost" style={{ flex: 1 }} onPress={() => setBarcodeOpen(true)} />
          <Btn title="Menü" icon="target" small kind="ghost" style={{ flex: 1 }} onPress={() => setMenuOpen(true)} />
          <Btn title="AI Koç" icon="nutrition" small kind="ghost" style={{ flex: 1 }} onPress={() => setCoachOpen(true)} />
        </View>

        {MEALS.map((meal) => {
          const entries = day.meals[meal.key];
          const kcal = entries.reduce((sum, e) => sum + e.kcal, 0);
          const tone = c[meal.tone];
          const toneSoft = c[meal.tone + "Soft"];
          return (
            <Card key={meal.key}>
              <View style={[s.rowBetween, { marginBottom: entries.length ? 8 : 0 }]}>
                <View style={[s.row, { gap: 10, flex: 1 }]}>
                  <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: toneSoft, alignItems: "center", justifyContent: "center" }}>
                    <Icon name={meal.icon} size={16} color={tone} strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={{ color: c.text, fontSize: 15, fontWeight: "700", letterSpacing: -0.2 }}>{meal.name}</Text>
                    <Text style={{ color: c.muted, fontSize: 11.5, fontWeight: "600", ...tnum }}>{fmt(kcal)} kcal</Text>
                  </View>
                </View>
                <Btn title="Ekle" icon="plus" small onPress={() => setAddMeal(meal)} />
              </View>
              {entries.length === 0 ? (
                <EmptyNote>Henüz bir şey eklenmedi</EmptyNote>
              ) : (
                entries.map((e, i) => (
                  <View key={e.id} style={[s.rowBetween, { paddingVertical: 9, borderBottomWidth: i === entries.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
                    <View style={{ flex: 1 }}>
                      <View style={[s.row, { gap: 6 }]}>
                        <Text style={{ color: c.text, fontWeight: "600", fontSize: 13.5 }}>{e.name}</Text>
                        {e.source === "ai" ? <Badge text="AI" kind="primary" /> : null}
                      </View>
                      <Text style={{ color: c.muted, fontSize: 11, marginTop: 1, ...tnum }}>
                        {e.time ? `${e.time} · ` : ""}{e.source === "recipe" ? "1 porsiyon" : `${fmt(e.grams)} g`} · P {fmt(e.p, 1)} · K {fmt(e.c, 1)} · Y {fmt(e.f, 1)}
                      </Text>
                    </View>
                    <Text style={{ color: c.text, fontWeight: "700", fontSize: 13, marginRight: 4, ...tnum }}>{fmt(e.kcal)}</Text>
                    <IconBtn name="trash" label="Sil" color={c.faint} size={17} onPress={() =>
                      dispatch({ type: "REMOVE_FOOD", dateKey, meal: meal.key, entryId: e.id })
                    } />
                  </View>
                ))
              )}
            </Card>
          );
        })}

        <Card>
          <CardTitle icon="plus">Özel Besin Oluştur</CardTitle>
          <Text style={{ color: c.muted, fontSize: 12.5, marginBottom: 12, lineHeight: 18 }}>
            Veritabanında olmayan bir besini 100 g başına değerleriyle ekle; aramalarda görünecektir.
          </Text>
          <Btn title="Özel besin ekle" icon="plus" kind="ghost" onPress={() => setCustomOpen(true)} />
        </Card>
      </ScrollView>

      {addMeal && (
        <AddFoodSheet
          meal={addMeal}
          dateKey={dateKey}
          onClose={() => setAddMeal(null)}
        />
      )}
      <CustomFoodSheet visible={customOpen} onClose={() => setCustomOpen(false)} />
      <PhotoAddSheet visible={photoOpen} dateKey={dateKey} onClose={() => setPhotoOpen(false)} />
      {barcodeOpen && <BarcodeScannerSheet dateKey={dateKey} onClose={() => setBarcodeOpen(false)} />}
      <AICoachSheet visible={coachOpen} dateKey={dateKey} onClose={() => setCoachOpen(false)} />
      <MenuPlannerSheet visible={menuOpen} dateKey={dateKey} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

/* Fotoğraf çek → AI ile kalori tahmini → öğüne ekle. Öğün saate göre otomatik seçilir. */
function PhotoAddSheet({ visible, dateKey, onClose }) {
  const c = useTheme();
  const { state, dispatch } = useData();
  const apiKey = state.settings.apiKey;

  const [uri, setUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [meal, setMeal] = useState(currentMealKey());
  const [grams, setGrams] = useState("");

  function reset() {
    setUri(null); setLoading(false); setError(null); setResult(null); setGrams("");
  }
  function close() { reset(); onClose(); }

  async function pick(fromCamera) {
    setError(null);
    try {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { setError("İzin verilmedi."); return; }
      const opts = { base64: true, quality: 0.5, allowsEditing: true, mediaTypes: ImagePicker.MediaTypeOptions.Images };
      const res = fromCamera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled) return;
      const asset = res.assets[0];
      setUri(asset.uri);
      setResult(null);
      if (!apiKey) { setError("API anahtarı yok. Profil > Yapay Zekâ bölümünden ekle."); return; }
      analyze(asset.base64);
    } catch (e) {
      setError("Görsel seçilemedi.");
    }
  }

  async function analyze(base64) {
    setLoading(true); setError(null);
    try {
      const r = await estimateFoodFromImage({ base64, apiKey });
      if (!r.kcal) { setError("Yemek tanınamadı. Daha net bir fotoğraf dene."); }
      setResult(r);
      setGrams(String(r.grams));
      setMeal(currentMealKey());
    } catch (e) {
      setError(e.message || "Tahmin başarısız.");
    } finally {
      setLoading(false);
    }
  }

  function addToLog() {
    if (!result) return;
    const g = parseNum(grams) || result.grams || 100;
    const scale = result.grams > 0 ? g / result.grams : 1;
    dispatch({
      type: "ADD_FOOD",
      dateKey,
      meal,
      entry: {
        name: result.name,
        grams: g,
        kcal: round(result.kcal * scale),
        p: round(result.p * scale, 1),
        c: round(result.c * scale, 1),
        f: round(result.f * scale, 1),
        time: timeStamp(),
        source: "ai",
      },
    });
    close();
  }

  return (
    <Sheet visible={visible} title="Fotoğrafla Ekle" onClose={close}>
      {!apiKey && (
        <View style={{ backgroundColor: c.warningSoft, borderRadius: radius.md, padding: 12, marginBottom: 14 }}>
          <Text style={{ color: c.warning, fontSize: 12.5, fontWeight: "600", lineHeight: 18 }}>
            AI kalori hesabı için OpenAI API anahtarı gerekli. Profil sekmesi → Yapay Zekâ bölümünden ekleyebilirsin.
          </Text>
        </View>
      )}

      {uri ? (
        <Image source={{ uri }} style={{ width: "100%", height: 200, borderRadius: radius.md, marginBottom: 14, backgroundColor: c.surface2 }} resizeMode="cover" />
      ) : (
        <View style={{ height: 150, borderRadius: radius.md, backgroundColor: c.surface2, borderWidth: StyleSheet.hairlineWidth, borderColor: c.border, alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
          <Icon name="nutrition" size={40} color={c.faint} strokeWidth={1.8} />
          <Text style={{ color: c.muted, fontSize: 13, marginTop: 8 }}>Yemek fotoğrafı seç</Text>
        </View>
      )}

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Btn title="Kamera" icon="plus" kind="primary" style={{ flex: 1 }} onPress={() => pick(true)} />
        <Btn title="Galeri" icon="plus" kind="ghost" style={{ flex: 1 }} onPress={() => pick(false)} />
      </View>

      {loading && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 16, justifyContent: "center" }}>
          <ActivityIndicator color={c.primary} />
          <Text style={{ color: c.muted, fontSize: 13 }}>AI yemeği analiz ediyor…</Text>
        </View>
      )}

      {error && !loading && (
        <Text style={{ color: c.danger, fontSize: 13, marginTop: 14, textAlign: "center" }}>{error}</Text>
      )}

      {result && !loading && (
        <View style={{ marginTop: 16 }}>
          <View style={[s.rowBetween, { marginBottom: 4 }]}>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: "800", flex: 1 }}>{result.name}</Text>
            <Badge text={`Güven: ${result.confidence === "high" ? "yüksek" : result.confidence === "low" ? "düşük" : "orta"}`} kind={result.confidence === "high" ? "success" : result.confidence === "low" ? "warning" : "neutral"} />
          </View>
          <Text style={{ color: c.accent, fontSize: 26, fontWeight: "800", ...tnum, marginBottom: 12 }}>{fmt(result.kcal)} kcal</Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            <MacroPill c={c} label="Protein" value={`${fmt(result.p, 1)} g`} />
            <MacroPill c={c} label="Karb" value={`${fmt(result.c, 1)} g`} />
            <MacroPill c={c} label="Yağ" value={`${fmt(result.f, 1)} g`} />
          </View>

          <Label>Miktar (gram)</Label>
          <Input value={grams} onChangeText={setGrams} keyboardType="numeric" />
          <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 4 }}>
            Gramı değiştirirsen kalori/makro orantılı güncellenir.
          </Text>

          <View style={{ height: 14 }} />
          <Label>Öğün (saate göre otomatik seçildi)</Label>
          <Segmented
            options={["kahvalti", "ogle", "aksam", "ara"].map((k) => ({ value: k, label: MEAL_NAMES[k].split(" ")[0] }))}
            value={meal}
            onChange={setMeal}
          />

          <View style={{ height: 16 }} />
          <Btn title="Öğüne Ekle" icon="check" kind="success" onPress={addToLog} />
        </View>
      )}
    </Sheet>
  );
}

function MacroPill({ c, label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.surface2, borderRadius: radius.sm, padding: 11, alignItems: "center" }}>
      <Text style={{ color: c.text, fontSize: 15, fontWeight: "800", ...tnum }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 11, marginTop: 2, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

/* AI beslenme koçu — sohbet, günlük duruma göre öneri */
const COACH_CHIPS = [
  "Bugün ne yiyeyim?",
  "Yüksek proteinli atıştırmalık öner",
  "Kalan makromu nasıl doldururum?",
  "Sağlıklı akşam yemeği fikri",
];

function AICoachSheet({ visible, dateKey, onClose }) {
  const c = useTheme();
  const { state } = useData();
  const apiKey = state.settings.apiKey;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totals = nutritionTotals(state, dateKey);
  const targets = macroTargets(state.profile);

  function buildContext() {
    const p = state.profile;
    const rem = {
      kcal: Math.round(targets.kcal - totals.kcal),
      p: Math.round(targets.protein - totals.p),
      c: Math.round(targets.carb - totals.c),
      f: Math.round(targets.fat - totals.f),
    };
    const goalTR = { lose: "kilo verme", maintain: "koruma", gain: "kas yapma" }[p.goal] || p.goal;
    return `Hedef: ${goalTR}. Günlük kalori hedefi ${targets.kcal} kcal (P ${targets.protein}g, K ${targets.carb}g, Y ${targets.fat}g).
Bugün alınan: ${Math.round(totals.kcal)} kcal (P ${Math.round(totals.p)}g, K ${Math.round(totals.c)}g, Y ${Math.round(totals.f)}g).
Kalan: ${rem.kcal} kcal (P ${rem.p}g, K ${rem.c}g, Y ${rem.f}g).`;
  }

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput(""); setError(null);
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await nutritionCoach({ apiKey, context: buildContext(), history: next });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message || "Yanıt alınamadı.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet visible={visible} title="AI Beslenme Koçu" onClose={onClose}>
      {!apiKey && (
        <View style={{ backgroundColor: c.warningSoft, borderRadius: radius.md, padding: 12, marginBottom: 14 }}>
          <Text style={{ color: c.warning, fontSize: 12.5, fontWeight: "600", lineHeight: 18 }}>
            AI koç için OpenAI API anahtarı gerekli. Profil → Yapay Zekâ bölümünden ekle.
          </Text>
        </View>
      )}

      {messages.length === 0 && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ color: c.muted, fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
            Günlük durumuna göre kişisel öneri al. Bir soru seç ya da yaz:
          </Text>
          <View style={{ gap: 8 }}>
            {COACH_CHIPS.map((q) => (
              <Pressable key={q} onPress={() => send(q)} style={({ pressed }) => ({ backgroundColor: pressed ? c.primarySoft : c.surface2, borderRadius: radius.md, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 })}>
                <Icon name="nutrition" size={17} color={c.primary} strokeWidth={2.2} />
                <Text style={{ color: c.text, fontSize: 14, fontWeight: "600", flex: 1 }}>{q}</Text>
                <Icon name="chevronRight" size={16} color={c.faint} strokeWidth={2.3} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {messages.map((m, i) => (
        <View key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", marginBottom: 10 }}>
          <View style={{ backgroundColor: m.role === "user" ? c.primary : c.surface2, borderRadius: 16, borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "user" ? 16 : 4, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={{ color: m.role === "user" ? c.onPrimary : c.text, fontSize: 14, lineHeight: 20 }}>{m.content}</Text>
          </View>
        </View>
      ))}

      {loading && (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <ActivityIndicator color={c.primary} />
          <Text style={{ color: c.muted, fontSize: 13 }}>Koç düşünüyor…</Text>
        </View>
      )}
      {error && <Text style={{ color: c.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text>}

      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-end", marginTop: 4 }}>
        <Input value={input} onChangeText={setInput} placeholder="Bir şey sor…" style={{ flex: 1 }} multiline />
        <Pressable onPress={() => send()} disabled={loading} style={({ pressed }) => ({ width: 46, height: 46, borderRadius: radius.md, backgroundColor: c.primary, alignItems: "center", justifyContent: "center", opacity: pressed || loading ? 0.7 : 1 })}>
          <Icon name="chevronRight" size={22} color={c.onPrimary} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Sheet>
  );
}

/* Besin arama + gram girme sheet'i */
function AddFoodSheet({ meal, dateKey, onClose }) {
  const c = useTheme();
  const { state, dispatch } = useData();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [grams, setGrams] = useState("100");

  const foods = useMemo(() => {
    const all = allFoods(state);
    const q = query.toLocaleLowerCase("tr");
    return all.filter((f) => f.name.toLocaleLowerCase("tr").includes(q)).slice(0, 30);
  }, [state, query]);

  const g = parseNum(grams);
  const k = g / 100;

  function confirm() {
    if (!selected || g <= 0) return;
    dispatch({
      type: "ADD_FOOD",
      dateKey,
      meal: meal.key,
      entry: {
        name: selected.name,
        grams: g,
        kcal: round(selected.kcal * k),
        p: round(selected.p * k, 1),
        c: round(selected.c * k, 1),
        f: round(selected.f * k, 1),
        time: timeStamp(),
      },
    });
    onClose();
  }

  return (
    <Sheet visible title={`${meal.name} — Besin Ekle`} onClose={onClose}>
      <Label>Besin ara</Label>
      <Input
        value={query}
        onChangeText={(t) => { setQuery(t); setSelected(null); }}
        placeholder="örn. tavuk, yulaf, elma..."
        autoFocus
      />

      {!selected ? (
        <View style={{
          borderColor: c.border, borderWidth: 1, borderRadius: 9,
          marginTop: 8, maxHeight: 280, overflow: "hidden",
        }}>
          <FlatList
            data={foods}
            keyExtractor={(f) => f.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<EmptyNote>Sonuç bulunamadı</EmptyNote>}
            renderItem={({ item: f }) => (
              <Pressable
                onPress={() => setSelected(f)}
                style={({ pressed }) => [s.rowBetween, {
                  padding: 11,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  backgroundColor: pressed ? c.primarySoft : "transparent",
                }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>{f.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11 }}>{f.cat}</Text>
                </View>
                <Text style={{ color: c.muted, fontSize: 11 }}>{f.kcal} kcal/100g</Text>
              </Pressable>
            )}
          />
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <Label>Miktar (gram)</Label>
          <Input value={grams} onChangeText={setGrams} keyboardType="numeric" />
          <View style={{ flexDirection: "row", gap: 7, marginTop: 8 }}>
            {[50, 100, 150, 200, 250].map((g) => (
              <Pressable key={g} onPress={() => setGrams(String(g))} style={({ pressed }) => ({ flex: 1, backgroundColor: parseNum(grams) === g ? c.primary : c.surface2, borderRadius: radius.sm, paddingVertical: 8, alignItems: "center", opacity: pressed ? 0.8 : 1 })}>
                <Text style={{ color: parseNum(grams) === g ? c.onPrimary : c.muted, fontSize: 12.5, fontWeight: "700" }}>{g}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: c.muted, fontSize: 12, marginVertical: 12 }}>
            <Text style={{ color: c.text, fontWeight: "700" }}>{selected.name}</Text>
            {"  —  "}{fmt(selected.kcal * k)} kcal · P {fmt(selected.p * k, 1)} g · K {fmt(selected.c * k, 1)} g · Y {fmt(selected.f * k, 1)} g
          </Text>
          <Btn title="Öğüne Ekle" onPress={confirm} />
          <View style={{ height: 8 }} />
          <Btn title="← Başka besin seç" kind="ghost" onPress={() => setSelected(null)} />
        </View>
      )}
    </Sheet>
  );
}

/* Özel besin oluşturma sheet'i */
function CustomFoodSheet({ visible, onClose }) {
  const { dispatch } = useData();
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [p, setP] = useState("");
  const [carb, setCarb] = useState("");
  const [fat, setFat] = useState("");

  function save() {
    const kc = parseNum(kcal);
    if (!name.trim() || kc <= 0) return;
    dispatch({
      type: "ADD_CUSTOM_FOOD",
      food: { name: name.trim(), kcal: kc, p: parseNum(p), c: parseNum(carb), f: parseNum(fat) },
    });
    setName(""); setKcal(""); setP(""); setCarb(""); setFat("");
    onClose();
  }

  return (
    <Sheet visible={visible} title="Özel Besin Oluştur" onClose={onClose}>
      <Label>Besin adı</Label>
      <Input value={name} onChangeText={setName} placeholder="örn. Ev yapımı granola" />
      <View style={{ height: 10 }} />
      <Label>Kalori (kcal / 100 g)</Label>
      <Input value={kcal} onChangeText={setKcal} keyboardType="numeric" />
      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Label>Protein (g)</Label>
          <Input value={p} onChangeText={setP} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Karb (g)</Label>
          <Input value={carb} onChangeText={setCarb} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Yağ (g)</Label>
          <Input value={fat} onChangeText={setFat} keyboardType="numeric" />
        </View>
      </View>
      <View style={{ height: 14 }} />
      <Btn title="Kaydet" onPress={save} />
    </Sheet>
  );
}
