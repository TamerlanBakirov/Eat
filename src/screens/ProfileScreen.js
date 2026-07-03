/* Profil ekranı: kişisel bilgiler, hedefler, hesaplanan değerler, veri yönetimi */
import React, { useState } from "react";
import { ScrollView, View, Text, Alert, Share } from "react-native";
import { useData } from "../lib/store";
import {
  bmr, tdee, macroTargets, bmi, bmiLabel, fmt, parseNum, todayKey,
} from "../lib/utils";
import {
  Card, CardTitle, Btn, Label, Input, OptionGroup, useTheme, s,
} from "../components/ui";
import DateHeader from "../components/DateHeader";

export default function ProfileScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const p = state.profile;

  const [name, setName] = useState(p.name);
  const [age, setAge] = useState(String(p.age));
  const [height, setHeight] = useState(String(p.height));
  const [weight, setWeight] = useState(String(p.weight));
  const [gender, setGender] = useState(p.gender);
  const [activity, setActivity] = useState(p.activityLevel);
  const [goal, setGoal] = useState(p.goal);

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
  };
  const targets = macroTargets(draft);
  const bmiVal = bmi(draft);

  function saveProfile() {
    dispatch({ type: "UPDATE_PROFILE", patch: draft });
    Alert.alert("Kaydedildi", "Profil bilgilerin güncellendi. ✅");
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
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16 }}>
      <DateHeader title="Profil" showDate={false} />

      <Card>
        <CardTitle>Kişisel Bilgiler</CardTitle>
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
        <CardTitle>Hesaplanan Değerler</CardTitle>
        <Row label="Bazal Metabolizma (BMR)" value={`${fmt(bmr(draft))} kcal`} />
        <Row label="Günlük Enerji Harcaması (TDEE)" value={`${fmt(tdee(draft))} kcal`} />
        <Row label="Günlük Kalori Hedefi" value={`${fmt(targets.kcal)} kcal`} />
        <Row label="Vücut Kitle İndeksi (BMI)" value={`${fmt(bmiVal, 1)} · ${bmiLabel(bmiVal)}`} />
        <Text style={{ color: c.muted, fontSize: 11, marginTop: 8 }}>
          BMR, Mifflin-St Jeor formülüyle hesaplanır. Hedef kalori, aktivite düzeyine ve hedefe göre uyarlanır.
        </Text>
      </Card>

      <Card>
        <CardTitle>Günlük Makro Hedefleri</CardTitle>
        <Row label="🥩 Protein" value={`${fmt(targets.protein)} g (1.8 g/kg)`} />
        <Row label="🍞 Karbonhidrat" value={`${fmt(targets.carb)} g`} />
        <Row label="🥑 Yağ" value={`${fmt(targets.fat)} g (%27)`} />
      </Card>

      <Card>
        <CardTitle>Görünüm</CardTitle>
        <OptionGroup
          options={[
            { value: "dark", label: "🌙 Koyu tema" },
            { value: "light", label: "☀️ Açık tema" },
          ]}
          value={state.settings.theme}
          onChange={(theme) => dispatch({ type: "SET_THEME", theme })}
        />
      </Card>

      <Card>
        <CardTitle>Veri Yönetimi</CardTitle>
        <Text style={{ color: c.muted, fontSize: 12, marginBottom: 10 }}>
          Verilerin yalnızca bu cihazda saklanır. Yedeklemek için dışa aktarabilirsin.
        </Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Btn title="⬇️ Dışa Aktar" kind="ghost" style={{ flex: 1 }} onPress={exportData} />
          <Btn title="Verileri Sıfırla" kind="danger" style={{ flex: 1 }} onPress={resetAll} />
        </View>
      </Card>
    </ScrollView>
  );
}

function Row({ label, value }) {
  const c = useTheme();
  return (
    <View style={[s.rowBetween, { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.border }]}>
      <Text style={{ color: c.text, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: c.text, fontSize: 13, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}
