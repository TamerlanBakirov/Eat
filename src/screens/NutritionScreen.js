/* Beslenme ekranı: öğün günlüğü, besin arama/ekleme, özel besin oluşturma */
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, Pressable, FlatList } from "react-native";
import { useData, useDate, getDay, nutritionTotals, allFoods } from "../lib/store";
import { macroTargets, fmt, round, parseNum } from "../lib/utils";
import {
  Card, CardTitle, Btn, IconBtn, ProgressBar, EmptyNote,
  Label, Input, Sheet, useTheme, s,
} from "../components/ui";
import DateHeader from "../components/DateHeader";

const MEALS = [
  { key: "kahvalti", name: "Kahvaltı", icon: "🌅" },
  { key: "ogle", name: "Öğle Yemeği", icon: "☀️" },
  { key: "aksam", name: "Akşam Yemeği", icon: "🌙" },
  { key: "ara", name: "Ara Öğün", icon: "🍿" },
];

export default function NutritionScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [addMeal, setAddMeal] = useState(null); // besin ekleme sheet'i açık olan öğün
  const [customOpen, setCustomOpen] = useState(false);

  const day = getDay(state, dateKey);
  const totals = nutritionTotals(state, dateKey);
  const targets = macroTargets(state.profile);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DateHeader title="Beslenme" />

        <Card>
          <CardTitle right={
            <Text style={{ color: c.muted, fontSize: 13, fontWeight: "600" }}>
              {fmt(totals.kcal)} / {fmt(targets.kcal)} kcal
            </Text>
          }>
            Günlük Toplam
          </CardTitle>
          <ProgressBar ratio={totals.kcal / targets.kcal} color={c.success} height={12} />
          <View style={[s.row, { gap: 14, marginTop: 10, flexWrap: "wrap" }]}>
            <Text style={{ color: c.muted, fontSize: 12 }}>Protein: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.p, 1)} g</Text></Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>Karb: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.c, 1)} g</Text></Text>
            <Text style={{ color: c.muted, fontSize: 12 }}>Yağ: <Text style={{ color: c.text, fontWeight: "700" }}>{fmt(totals.f, 1)} g</Text></Text>
          </View>
        </Card>

        {MEALS.map((meal) => {
          const entries = day.meals[meal.key];
          const kcal = entries.reduce((sum, e) => sum + e.kcal, 0);
          return (
            <Card key={meal.key}>
              <View style={[s.rowBetween, { marginBottom: entries.length ? 6 : 0 }]}>
                <Text style={{ color: c.text, fontSize: 15, fontWeight: "700" }}>{meal.icon} {meal.name}</Text>
                <View style={[s.row, { gap: 10 }]}>
                  <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600" }}>{fmt(kcal)} kcal</Text>
                  <Btn title="+ Ekle" small onPress={() => setAddMeal(meal)} />
                </View>
              </View>
              {entries.length === 0 ? (
                <EmptyNote>Henüz bir şey eklenmedi</EmptyNote>
              ) : (
                entries.map((e) => (
                  <View key={e.id} style={[s.rowBetween, { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: "600", fontSize: 13 }}>{e.name}</Text>
                      <Text style={{ color: c.muted, fontSize: 11 }}>
                        {fmt(e.grams)} g · P {fmt(e.p, 1)} · K {fmt(e.c, 1)} · Y {fmt(e.f, 1)}
                      </Text>
                    </View>
                    <Text style={{ color: c.text, fontWeight: "700", fontSize: 13, marginRight: 6 }}>{fmt(e.kcal)}</Text>
                    <IconBtn label="🗑" onPress={() =>
                      dispatch({ type: "REMOVE_FOOD", dateKey, meal: meal.key, entryId: e.id })
                    } />
                  </View>
                ))
              )}
            </Card>
          );
        })}

        <Card>
          <CardTitle>Özel Besin Oluştur</CardTitle>
          <Text style={{ color: c.muted, fontSize: 12, marginBottom: 10 }}>
            Veritabanında olmayan bir besini 100 g başına değerleriyle ekle; aramalarda görünecektir.
          </Text>
          <Btn title="+ Özel besin ekle" kind="ghost" onPress={() => setCustomOpen(true)} />
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
    </View>
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
      },
    });
    onClose();
  }

  return (
    <Sheet visible title={`${meal.icon} ${meal.name} — Besin Ekle`} onClose={onClose}>
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
