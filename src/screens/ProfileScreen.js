/* Profil ekranı: kişisel bilgiler, hedefler, hesaplanan değerler, veri yönetimi */
import React, { useState } from "react";
import { ScrollView, View, Text, Alert, Share, Pressable, StyleSheet } from "react-native";
import { useData } from "../lib/store";
import {
  bmr, tdee, macroTargets, bmi, bmiLabel, fmt, parseNum, todayKey, shiftKey, formatKey,
} from "../lib/utils";
import { generateProgram } from "../lib/program";
import {
  Card, CardTitle, Btn, Label, Input, OptionGroup, Badge, Sheet, useTheme, s,
} from "../components/ui";
import { Icon } from "../components/icons";
import { IOSSwitch } from "../components/ios";
import { setWaterReminders, setWorkoutReminder } from "../lib/notify";
import { macroColors, radius, tnum, ACCENTS } from "../theme";
import DateHeader from "../components/DateHeader";

export default function ProfileScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const p = state.profile;
  const mc = macroColors(c);
  const isDark = state.settings.theme === "dark";
  const [apiKey, setApiKey] = useState(state.settings.apiKey || "");
  const [keySaved, setKeySaved] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const program = state.program;

  const [name, setName] = useState(p.name);
  const [age, setAge] = useState(String(p.age));
  const [height, setHeight] = useState(String(p.height));
  const [weight, setWeight] = useState(String(p.weight));
  const [gender, setGender] = useState(p.gender);
  const [activity, setActivity] = useState(p.activityLevel);
  const [goal, setGoal] = useState(p.goal);
  const [goalWeight, setGoalWeight] = useState(p.goalWeight ? String(p.goalWeight) : "");
  const [goalWeeks, setGoalWeeks] = useState(p.goalWeeks ? String(p.goalWeeks) : "");

  // Hesaplanan değerler formdaki güncel girdiyi yansıtsın
  const draft = {
    ...p,
    name: name.trim(),
    age: parseNum(age) || 25,
    height: parseNum(height) || 175,
    weight: parseNum(weight) || 75,
    gender,
    activityLevel: activity,
    goal,
    goalWeight: parseNum(goalWeight) || null,
    goalWeeks: parseNum(goalWeeks) || null,
  };
  const targets = macroTargets(draft);
  const bmiVal = bmi(draft);

  // Hedef projeksiyonu
  const gw = parseNum(goalWeight);
  const wks = parseNum(goalWeeks);
  const gDiff = gw > 0 ? gw - draft.weight : 0;
  const ratePerWeek = wks > 0 && gw > 0 ? gDiff / wks : 0;
  const goalDailyKcal = Math.round((ratePerWeek * 7700) / 7);
  const goalEta = wks > 0 ? formatKey(shiftKey(todayKey(), Math.round(wks * 7))) : null;
  const goalSafe = Math.abs(ratePerWeek) <= 1;

  function saveProfile() {
    dispatch({ type: "UPDATE_PROFILE", patch: draft });
    Alert.alert("Kaydedildi", "Profil bilgilerin güncellendi.");
  }

  function saveKey() {
    dispatch({ type: "SET_SETTING", key: "apiKey", value: apiKey.trim() });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  }

  function regenerateProgram() {
    dispatch({ type: "UPDATE_PROFILE", patch: draft });
    dispatch({ type: "SET_PROGRAM", program: generateProgram(draft) });
    Alert.alert("Program güncellendi", "Yeni bilgilerine göre spor ve beslenme programın yeniden oluşturuldu.");
  }

  async function toggleWater(on) {
    dispatch({ type: "SET_SETTING", key: "notifyWater", value: on });
    const ok = await setWaterReminders(on);
    if (on && !ok) {
      dispatch({ type: "SET_SETTING", key: "notifyWater", value: false });
      Alert.alert("Bildirim açılamadı", "Bildirim izni verilmedi ya da bu platformda desteklenmiyor (web).");
    }
  }
  async function toggleWorkout(on) {
    dispatch({ type: "SET_SETTING", key: "notifyWorkout", value: on });
    const ok = await setWorkoutReminder(on);
    if (on && !ok) {
      dispatch({ type: "SET_SETTING", key: "notifyWorkout", value: false });
      Alert.alert("Bildirim açılamadı", "Bildirim izni verilmedi ya da bu platformda desteklenmiyor (web).");
    }
  }

  async function exportData() {
    try {
      await Share.share({
        title: `fitlife-yedek-${todayKey()}.json`,
        message: JSON.stringify(state, null, 2),
      });
    } catch (e) {
      // Kullanıcı paylaşımı iptal ettiyse sessiz geç
    }
  }

  function resetAll() {
    Alert.alert(
      "Tüm Verileri Sıfırla",
      "Tüm kayıtların silinecek. Bu işlem geri alınamaz. Emin misin?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sıfırla", style: "destructive", onPress: () => dispatch({ type: "RESET" }) },
      ]
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <DateHeader title="Profil" showDate={false} />

      <Card>
        <CardTitle icon="profile">Kişisel Bilgiler</CardTitle>
        <Label>İsim</Label>
        <Input value={name} onChangeText={setName} placeholder="Adın" />
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <Label>Yaş</Label>
            <Input value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Boy (cm)</Label>
            <Input value={height} onChangeText={setHeight} keyboardType="numeric" />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Kilo (kg)</Label>
            <Input value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <Label>Cinsiyet</Label>
          <OptionGroup
            options={[
              { value: "male", label: "Erkek" },
              { value: "female", label: "Kadın" },
            ]}
            value={gender}
            onChange={setGender}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Label>Aktivite düzeyi</Label>
          <OptionGroup
            options={[
              { value: "sedentary", label: "Hareketsiz" },
              { value: "light", label: "Az (1-3 gün)" },
              { value: "moderate", label: "Orta (3-5 gün)" },
              { value: "active", label: "Aktif (6-7 gün)" },
              { value: "very_active", label: "Çok aktif" },
            ]}
            value={activity}
            onChange={setActivity}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Label>Hedef</Label>
          <OptionGroup
            options={[
              { value: "lose", label: "Kilo ver (−500)" },
              { value: "maintain", label: "Koru" },
              { value: "gain", label: "Kas al (+400)" },
            ]}
            value={goal}
            onChange={setGoal}
          />
        </View>
        <View style={{ height: 14 }} />
        <Btn title="Profili Kaydet" onPress={saveProfile} />
      </Card>

      <Card>
        <CardTitle icon="target">Hesaplanan Değerler</CardTitle>
        <Row label="Bazal Metabolizma (BMR)" value={`${fmt(bmr(draft))} kcal`} />
        <Row label="Günlük Enerji Harcaması (TDEE)" value={`${fmt(tdee(draft))} kcal`} />
        <Row label="Günlük Kalori Hedefi" value={`${fmt(targets.kcal)} kcal`} highlight />
        <Row label="Vücut Kitle İndeksi (BMI)" value={`${fmt(bmiVal, 1)} · ${bmiLabel(bmiVal)}`} last />
        <Text style={{ color: c.muted, fontSize: 11, marginTop: 10, lineHeight: 16 }}>
          BMR, Mifflin-St Jeor formülüyle hesaplanır. Hedef kalori, aktivite düzeyine ve hedefe göre uyarlanır.
        </Text>
      </Card>

      <Card>
        <CardTitle icon="target">Kilo Hedefi & Tarih</CardTitle>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Label>Hedef kilo (kg)</Label>
            <Input value={goalWeight} onChangeText={setGoalWeight} keyboardType="numeric" placeholder="örn. 70" />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Süre (hafta)</Label>
            <Input value={goalWeeks} onChangeText={setGoalWeeks} keyboardType="numeric" placeholder="örn. 12" />
          </View>
        </View>
        {gw > 0 && wks > 0 && (
          <View style={{ marginTop: 14, backgroundColor: goalSafe ? c.primarySoft : c.warningSoft, borderRadius: radius.md, padding: 13 }}>
            <Row label="Değişim" value={`${gDiff > 0 ? "+" : ""}${fmt(gDiff, 1)} kg`} />
            <Row label="Haftalık hız" value={`${ratePerWeek > 0 ? "+" : ""}${fmt(ratePerWeek, 2)} kg/hafta`} />
            <Row label="Günlük kalori ayarı" value={`${goalDailyKcal > 0 ? "+" : ""}${fmt(goalDailyKcal)} kcal`} />
            <Row label="Tahmini bitiş" value={goalEta} last />
            <Text style={{ color: goalSafe ? c.primary : c.warning, fontSize: 12, fontWeight: "700", marginTop: 8 }}>
              {goalSafe ? "✓ Güvenli, sürdürülebilir tempo" : "⚠ Haftada 1 kg'dan hızlı — süreyi uzatmayı düşün"}
            </Text>
          </View>
        )}
        <View style={{ height: 12 }} />
        <Btn title="Hedefi Kaydet" icon="check" onPress={saveProfile} />
      </Card>

      <Card>
        <CardTitle icon="nutrition">Günlük Makro Hedefleri</CardTitle>
        <Row label="Protein" dot={mc.protein} value={`${fmt(targets.protein)} g (1.8 g/kg)`} />
        <Row label="Karbonhidrat" dot={mc.carb} value={`${fmt(targets.carb)} g`} />
        <Row label="Yağ" dot={mc.fat} value={`${fmt(targets.fat)} g (%27)`} last />
      </Card>

      <Card>
        <CardTitle icon={isDark ? "moon" : "sun"}>Görünüm</CardTitle>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {[
            { value: "dark", label: "Koyu tema", icon: "moon" },
            { value: "light", label: "Açık tema", icon: "sun" },
          ].map((opt) => {
            const active = state.settings.theme === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => dispatch({ type: "SET_THEME", theme: opt.value })}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 13,
                  borderRadius: radius.md,
                  borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                  borderColor: active ? c.primary : c.border,
                  backgroundColor: active ? c.primarySoft : c.surface2,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Icon name={opt.icon} size={18} color={active ? c.primary : c.muted} strokeWidth={2.2} />
                <Text style={{ color: active ? c.primary : c.muted, fontWeight: "700", fontSize: 13.5 }}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: c.muted, fontSize: 12.5, fontWeight: "600", marginTop: 16, marginBottom: 10 }}>Vurgu Rengi</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {Object.entries(ACCENTS).map(([key, a]) => {
            const active = (state.settings.accent || "green") === key;
            return (
              <Pressable key={key} onPress={() => dispatch({ type: "SET_SETTING", key: "accent", value: key })} accessibilityLabel={a.name}
                style={{ width: 44, height: 44, borderRadius: 999, backgroundColor: a.swatch, alignItems: "center", justifyContent: "center", borderWidth: active ? 3 : 0, borderColor: c.text }}>
                {active ? <Icon name="check" size={20} color="#fff" strokeWidth={3} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <CardTitle icon="droplet">Su Hedefi</CardTitle>
        <View style={[s.rowBetween]}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: "600" }}>Günlük hedef</Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>Kilona göre öneri: ~{Math.max(6, Math.round((p.weight || 70) * 0.033 / 0.25))} bardak</Text>
          </View>
          <View style={[s.row, { gap: 10 }]}>
            <Pressable onPress={() => dispatch({ type: "SET_SETTING", key: "waterGoal", value: Math.max(1, (state.settings.waterGoal || 8) - 1) })} style={{ width: 38, height: 38, borderRadius: radius.sm, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
              <Icon name="minus" size={18} color={c.text} strokeWidth={2.4} />
            </Pressable>
            <Text style={{ color: c.text, fontSize: 20, fontWeight: "800", minWidth: 28, textAlign: "center", ...tnum }}>{state.settings.waterGoal || 8}</Text>
            <Pressable onPress={() => dispatch({ type: "SET_SETTING", key: "waterGoal", value: Math.min(20, (state.settings.waterGoal || 8) + 1) })} style={{ width: 38, height: 38, borderRadius: radius.sm, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={18} color={c.text} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>
      </Card>

      <Card>
        <CardTitle icon="target" right={program ? <Badge text={`${program.daysPerWeek} gün/hafta`} kind="primary" /> : null}>
          Antrenman Programım
        </CardTitle>
        {program ? (
          <>
            <View style={{ gap: 7, marginBottom: 12 }}>
              {program.split.map((d, i) => (
                <View key={d.key} style={[s.row, { gap: 10 }]}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: c.primary, fontSize: 11, fontWeight: "800" }}>{i + 1}</Text>
                  </View>
                  <Text style={{ color: c.text, fontSize: 13.5, fontWeight: "600", flex: 1 }}>{d.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11.5 }}>{d.focus}</Text>
                </View>
              ))}
            </View>
            <Btn title="Programı Yeniden Oluştur" icon="progress" kind="ghost" onPress={regenerateProgram} />
          </>
        ) : (
          <Btn title="Program Oluştur" icon="target" onPress={regenerateProgram} />
        )}
      </Card>

      <Card>
        <CardTitle icon="edit">Yapay Zekâ (Foto → Kalori)</CardTitle>
        <Text style={{ color: c.muted, fontSize: 12.5, marginBottom: 12, lineHeight: 18 }}>
          Beslenme sekmesinde yemek fotoğrafı çekip kalorisini otomatik hesaplamak için OpenAI API anahtarını gir. Anahtar yalnızca bu cihazda saklanır.
        </Text>
        <Label>OpenAI API anahtarı</Label>
        <Input
          value={apiKey}
          onChangeText={(t) => { setApiKey(t); setKeySaved(false); }}
          placeholder="sk-..."
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <View style={{ height: 12 }} />
        <Btn
          title={keySaved ? "Kaydedildi ✓" : "Anahtarı Kaydet"}
          icon={keySaved ? "check" : undefined}
          kind={keySaved ? "success" : "primary"}
          onPress={saveKey}
        />
      </Card>

      <Card>
        <CardTitle icon="clock">Bildirimler</CardTitle>
        <View style={[s.rowBetween, { paddingVertical: 8 }]}>
          <View style={[s.row, { gap: 11, flex: 1 }]}>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
              <Icon name="droplet" size={16} color="#fff" strokeWidth={2.3} />
            </View>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: "500", flex: 1 }}>Su içme hatırlatması</Text>
          </View>
          <IOSSwitch value={state.settings.notifyWater} onValueChange={toggleWater} />
        </View>
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginVertical: 2 }} />
        <View style={[s.rowBetween, { paddingVertical: 8 }]}>
          <View style={[s.row, { gap: 11, flex: 1 }]}>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
              <Icon name="workout" size={16} color="#fff" strokeWidth={2.3} />
            </View>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: "500", flex: 1 }}>Antrenman hatırlatması</Text>
          </View>
          <IOSSwitch value={state.settings.notifyWorkout} onValueChange={toggleWorkout} />
        </View>
        <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 8, lineHeight: 16 }}>
          Yerel bildirimler telefonda çalışır (web'de desteklenmez).
        </Text>
      </Card>

      <Card>
        <CardTitle icon="edit">Veri Yönetimi</CardTitle>
        <Text style={{ color: c.muted, fontSize: 12.5, marginBottom: 12, lineHeight: 18 }}>
          Verilerin yalnızca bu cihazda saklanır. Yedeklemek için dışa aktarabilirsin.
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Btn title="Dışa Aktar" icon="progress" kind="ghost" style={{ flex: 1 }} onPress={exportData} />
          <Btn title="İçe Aktar" icon="plus" kind="ghost" style={{ flex: 1 }} onPress={() => setImportOpen(true)} />
        </View>
        <View style={{ height: 10 }} />
        <Btn title="Tüm Verileri Sıfırla" icon="trash" kind="danger" onPress={resetAll} />
      </Card>

      <ImportSheet visible={importOpen} onClose={() => setImportOpen(false)} />
    </ScrollView>
  );
}

/* Yedek geri yükleme — JSON yapıştır → doğrula → içe aktar */
function ImportSheet({ visible, onClose }) {
  const c = useTheme();
  const { dispatch } = useData();
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  function restore() {
    setError(null);
    let parsed;
    try { parsed = JSON.parse(text); } catch { setError("Geçersiz JSON. Dışa aktarılan metnin tamamını yapıştır."); return; }
    if (!parsed || typeof parsed !== "object" || (!parsed.profile && !parsed.logs)) {
      setError("Bu bir FitLife yedeği gibi görünmüyor."); return;
    }
    Alert.alert("Yedeği geri yükle", "Mevcut tüm verilerin bu yedekle değiştirilecek. Emin misin?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Geri Yükle", style: "destructive", onPress: () => { dispatch({ type: "IMPORT_DATA", state: parsed }); setText(""); onClose(); Alert.alert("Tamam", "Verilerin geri yüklendi."); } },
    ]);
  }

  return (
    <Sheet visible={visible} title="Yedeği Geri Yükle" onClose={onClose}>
      <Text style={{ color: c.muted, fontSize: 13, marginBottom: 12, lineHeight: 19 }}>
        Daha önce "Dışa Aktar" ile aldığın JSON metnini buraya yapıştır.
      </Text>
      <Label>Yedek JSON</Label>
      <Input value={text} onChangeText={setText} placeholder='{"profile":...}' multiline style={{ height: 160, textAlignVertical: "top" }} />
      {error ? <Text style={{ color: c.danger, fontSize: 12.5, marginTop: 8 }}>{error}</Text> : null}
      <View style={{ height: 14 }} />
      <Btn title="Geri Yükle" icon="check" onPress={restore} />
    </Sheet>
  );
}

function Row({ label, value, dot, highlight, last }) {
  const c = useTheme();
  return (
    <View style={[s.rowBetween, { paddingVertical: 9, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      <View style={[s.row, { gap: 8 }]}>
        {dot ? <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: dot }} /> : null}
        <Text style={{ color: c.text, fontSize: 13, fontWeight: "500" }}>{label}</Text>
      </View>
      <Text style={{ color: highlight ? c.primary : c.text, fontSize: 13.5, fontWeight: "700", ...tnum }}>{value}</Text>
    </View>
  );
}
