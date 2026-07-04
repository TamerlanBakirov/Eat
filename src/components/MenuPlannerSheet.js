/* Menü planlayıcı — günlük kalori hedefini öğünlere böler, uygun tarif önerir. */
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useData } from "../lib/store";
import { macroTargets, fmt, timeStamp, MEAL_NAMES } from "../lib/utils";
import { planDay, RECIPES } from "../data/recipes";
import { Sheet, Btn, Badge, useTheme, s } from "./ui";
import { Icon } from "./icons";
import { Segmented } from "./ios";
import { radius, tnum } from "../theme";

export default function MenuPlannerSheet({ visible, dateKey, onClose }) {
  const c = useTheme();
  const { state, dispatch } = useData();
  const [tab, setTab] = useState("plan");
  const [nonce, setNonce] = useState(0); // "yeni plan" için

  const program = state.program;
  const budgets = program?.nutrition?.meals || (() => {
    const t = macroTargets(state.profile).kcal;
    return [
      { key: "kahvalti", name: "Kahvaltı", kcal: Math.round(t * 0.28) },
      { key: "ogle", name: "Öğle Yemeği", kcal: Math.round(t * 0.34) },
      { key: "aksam", name: "Akşam Yemeği", kcal: Math.round(t * 0.28) },
      { key: "ara", name: "Ara Öğün", kcal: Math.round(t * 0.10) },
    ];
  })();

  const plan = React.useMemo(() => planDay(budgets.map((b) => ({ key: b.key, name: b.name, kcal: b.kcal }))), [nonce, program]);

  function addRecipe(mealKey, r) {
    dispatch({
      type: "ADD_FOOD", dateKey, meal: mealKey,
      entry: { name: r.name, grams: 1, kcal: r.kcal, p: r.p, c: r.c, f: r.f, time: timeStamp(), source: "recipe" },
    });
  }
  function addAll() {
    plan.forEach((row) => { if (row.recipe) addRecipe(row.key, row.recipe); });
    onClose();
  }

  return (
    <Sheet visible={visible} title="Menü & Tarifler" onClose={onClose}>
      <Segmented options={[{ value: "plan", label: "Günlük Plan" }, { value: "recipes", label: "Tarifler" }]} value={tab} onChange={setTab} />
      <View style={{ height: 14 }} />

      {tab === "plan" ? (
        <>
          <View style={[s.rowBetween, { marginBottom: 10 }]}>
            <Text style={{ color: c.muted, fontSize: 13 }}>Hedefe göre önerilen gün</Text>
            <Pressable onPress={() => setNonce((n) => n + 1)} hitSlop={8}>
              <Text style={{ color: c.primary, fontSize: 13, fontWeight: "700" }}>Yeni plan</Text>
            </Pressable>
          </View>
          {plan.map((row) => (
            <View key={row.key} style={{ backgroundColor: c.surface2, borderRadius: radius.md, padding: 13, marginBottom: 10 }}>
              <View style={[s.rowBetween, { marginBottom: 6 }]}>
                <Text style={{ color: c.muted, fontSize: 12, fontWeight: "700" }}>{MEAL_NAMES[row.key]}</Text>
                <Text style={{ color: c.faint, fontSize: 11, ...tnum }}>~{fmt(row.target)} kcal hedef</Text>
              </View>
              {row.recipe ? (
                <>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: "700" }}>{row.recipe.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 12, marginTop: 2, ...tnum }}>
                    {fmt(row.recipe.kcal)} kcal · P {row.recipe.p} · K {row.recipe.c} · Y {row.recipe.f}
                  </Text>
                  <View style={[s.rowBetween, { marginTop: 8 }]}>
                    <Text style={{ color: c.faint, fontSize: 11, flex: 1 }} numberOfLines={1}>{row.recipe.ingredients.join(", ")}</Text>
                    <Pressable onPress={() => addRecipe(row.key, row.recipe)} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Icon name="plus" size={15} color={c.primary} strokeWidth={2.5} />
                      <Text style={{ color: c.primary, fontSize: 13, fontWeight: "700" }}>Ekle</Text>
                    </Pressable>
                  </View>
                </>
              ) : <Text style={{ color: c.muted, fontSize: 13 }}>Uygun tarif yok</Text>}
            </View>
          ))}
          <View style={{ height: 6 }} />
          <Btn title="Tüm Planı Güne Ekle" icon="check" onPress={addAll} />
        </>
      ) : (
        RECIPES.map((r) => (
          <View key={r.id} style={[s.rowBetween, { paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: c.border }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: c.text, fontSize: 14, fontWeight: "700" }}>{r.name}</Text>
              <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1, ...tnum }}>{fmt(r.kcal)} kcal · P {r.p} · K {r.c} · Y {r.f}</Text>
              <View style={[s.row, { gap: 5, marginTop: 4 }]}>
                {r.meals.map((m) => <Badge key={m} text={MEAL_NAMES[m].split(" ")[0]} kind="neutral" />)}
              </View>
            </View>
            <Pressable onPress={() => addRecipe(r.meals[0], r)} hitSlop={8} style={{ width: 38, height: 38, borderRadius: radius.sm, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
              <Icon name="plus" size={19} color={c.onPrimary} strokeWidth={2.5} />
            </Pressable>
          </View>
        ))
      )}
    </Sheet>
  );
}
