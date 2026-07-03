/* Özet ekranı: kalori dengesi, makrolar, su takibi, haftalık grafikler */
import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useData, useDate, nutritionTotals, workoutCalories, getDay } from "../lib/store";
import { macroTargets, fmt, lastNDays, shortDay } from "../lib/utils";
import { Card, CardTitle, StatTile, ProgressBar, Badge, EmptyNote, useTheme, s } from "../components/ui";
import { Ring, BarChart } from "../components/charts";
import DateHeader from "../components/DateHeader";
import { macroColors } from "../theme";

export default function DashboardScreen() {
  const c = useTheme();
  const mc = macroColors(c);
  const { state, dispatch } = useData();
  const { dateKey } = useDate();

  const targets = macroTargets(state.profile);
  const totals = nutritionTotals(state, dateKey);
  const burned = workoutCalories(state, dateKey);
  const net = totals.kcal - burned;
  const remaining = targets.kcal - net;
  const day = getDay(state, dateKey);

  const weekKeys = lastNDays(7, dateKey);
  const weekIn = weekKeys.map((k) => ({ label: shortDay(k), value: Math.round(nutritionTotals(state, k).kcal) }));
  const weekOut = weekKeys.map((k) => ({ label: shortDay(k), value: workoutCalories(state, k) }));

  const badge = net <= 0
    ? { text: "Güne başla", kind: "primary" }
    : net / targets.kcal < 0.8
      ? { text: "Yolunda gidiyor", kind: "primary" }
      : net / targets.kcal <= 1.05
        ? { text: "Hedefe uygun", kind: "success" }
        : { text: "Hedef aşıldı", kind: "danger" };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16 }}>
      <DateHeader title="Özet" />

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <StatTile label="Alınan" value={fmt(totals.kcal)} sub={`hedef ${fmt(targets.kcal)} kcal`} />
        <StatTile label="Yakılan" value={fmt(burned)} sub="kcal antrenman" color={c.success} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <StatTile label="Net" value={fmt(net)} sub="alınan − yakılan" />
        <StatTile
          label="Kalan"
          value={fmt(remaining)}
          sub={remaining >= 0 ? "kcal hakkın var" : "hedefi aştın"}
          color={remaining >= 0 ? c.success : c.danger}
        />
      </View>

      <Card>
        <CardTitle>Kalori Hedefi</CardTitle>
        <View style={[s.row, { gap: 18 }]}>
          <Ring
            value={net}
            target={targets.kcal}
            label={fmt(Math.max(net, 0))}
            sublabel={`/ ${fmt(targets.kcal)} kcal`}
          />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ color: c.text, fontSize: 13 }}>
              Net alım: <Text style={{ fontWeight: "800" }}>{fmt(net)} kcal</Text>
            </Text>
            <Text style={{ color: c.text, fontSize: 13 }}>
              Hedef: <Text style={{ fontWeight: "800" }}>{fmt(targets.kcal)} kcal</Text>
            </Text>
            <Badge text={badge.text} kind={badge.kind} />
          </View>
        </View>
      </Card>

      <Card>
        <CardTitle>Makro Besinler</CardTitle>
        <MacroBar name="Protein" value={totals.p} target={targets.protein} color={mc.protein} />
        <MacroBar name="Karbonhidrat" value={totals.c} target={targets.carb} color={mc.carb} />
        <MacroBar name="Yağ" value={totals.f} target={targets.fat} color={mc.fat} />
      </Card>

      <Card>
        <CardTitle right={<Text style={{ color: c.muted, fontSize: 13, fontWeight: "600" }}>{day.water} / 8 bardak</Text>}>
          Su Takibi
        </CardTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: 8 }, (_, i) => {
            const filled = i < day.water;
            return (
              <Pressable
                key={i}
                onPress={() => dispatch({
                  type: "SET_WATER",
                  dateKey,
                  // Aynı bardağa tekrar dokununca geri al
                  glasses: day.water === i + 1 ? i : i + 1,
                })}
                style={{
                  width: 38, height: 44,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: filled ? c.primary : c.border,
                  backgroundColor: filled ? c.primarySoft : c.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 15 }}>💧</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <CardTitle>Son 7 Gün — Alınan Kalori</CardTitle>
        <BarChart data={weekIn} target={targets.kcal} />
      </Card>

      <Card>
        <CardTitle>Son 7 Gün — Yakılan Kalori</CardTitle>
        <BarChart data={weekOut} color={c.success} />
      </Card>

      <Card>
        <CardTitle right={<Badge text={`${day.workouts.length} antrenman`} />}>Bugünün Antrenmanları</CardTitle>
        {day.workouts.length === 0 ? (
          <EmptyNote>Bu tarihte kayıtlı antrenman yok. Antrenman sekmesinden ekleyebilirsin. 💪</EmptyNote>
        ) : (
          day.workouts.map((w) => (
            <View key={w.id} style={[s.rowBetween, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: "600", fontSize: 14 }}>{w.name}</Text>
                <Text style={{ color: c.muted, fontSize: 12 }}>{w.exercises.length} hareket · {w.duration} dk</Text>
              </View>
              <Text style={{ color: c.text, fontWeight: "700", fontSize: 13 }}>🔥 {fmt(w.kcal)} kcal</Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

function MacroBar({ name, value, target, color }) {
  const c = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      <View style={[s.rowBetween, { marginBottom: 4 }]}>
        <Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>{name}</Text>
        <Text style={{ color: c.muted, fontSize: 12 }}>{fmt(value, 1)} / {fmt(target)} g</Text>
      </View>
      <ProgressBar ratio={target > 0 ? value / target : 0} color={color} />
    </View>
  );
}
