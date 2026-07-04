/* Özet ekranı: kalori dengesi, makrolar, su takibi, haftalık grafikler */
import React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useData, useDate, nutritionTotals, workoutCalories, getDay } from "../lib/store";
import { macroTargets, fmt, lastNDays, shortDay } from "../lib/utils";
import { Card, CardTitle, StatTile, ProgressBar, Badge, EmptyNote, useTheme, s } from "../components/ui";
import { Ring, BarChart } from "../components/charts";
import { Icon } from "../components/icons";
import StepCard from "../components/StepCard";
import DateHeader from "../components/DateHeader";
import { macroColors, tnum } from "../theme";

export default function DashboardScreen() {
  const c = useTheme();
  const mc = macroColors(c);
  const { state, dispatch } = useData();
  const { dateKey } = useDate();

  const targets = macroTargets(state.profile);
  const waterGoal = state.settings.waterGoal || 8;
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
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <DateHeader title="Özet" />

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <StatTile label="Alınan" value={fmt(totals.kcal)} sub={`hedef ${fmt(targets.kcal)} kcal`} icon="flame" color={c.accent} tint={c.accentSoft} />
        <StatTile label="Yakılan" value={fmt(burned)} sub="kcal antrenman" color={c.success} icon="workout" tint={c.successSoft} />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <StatTile label="Net" value={fmt(net)} sub="alınan − yakılan" icon="target" color={c.primary} tint={c.primarySoft} />
        <StatTile
          label="Kalan"
          value={fmt(remaining)}
          sub={remaining >= 0 ? "kcal hakkın var" : "hedefi aştın"}
          color={remaining >= 0 ? c.success : c.danger}
          icon={remaining >= 0 ? "check" : "flame"}
          tint={remaining >= 0 ? c.successSoft : c.dangerSoft}
        />
      </View>

      <Card>
        <CardTitle icon="target">Kalori Hedefi</CardTitle>
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

      <StepCard />

      <Card>
        <CardTitle icon="nutrition">Makro Besinler</CardTitle>
        <MacroBar name="Protein" value={totals.p} target={targets.protein} color={mc.protein} />
        <MacroBar name="Karbonhidrat" value={totals.c} target={targets.carb} color={mc.carb} />
        <MacroBar name="Yağ" value={totals.f} target={targets.fat} color={mc.fat} />
      </Card>

      <Card>
        <CardTitle icon="droplet" right={<Text style={{ color: c.muted, fontSize: 13, fontWeight: "600" }}>{day.water} / {waterGoal} bardak</Text>}>
          Su Takibi
        </CardTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: waterGoal }, (_, i) => {
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
                accessibilityLabel={`${i + 1}. bardak`}
                style={{
                  width: 38, height: 44,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: filled ? c.primary : c.border,
                  backgroundColor: filled ? c.primarySoft : c.surface2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="droplet" size={17} color={filled ? c.primary : c.faint} strokeWidth={2} fill={filled ? c.primary : "none"} />
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card>
        <CardTitle icon="flame">Son 7 Gün — Alınan Kalori</CardTitle>
        <BarChart data={weekIn} target={targets.kcal} />
      </Card>

      <Card>
        <CardTitle icon="workout">Son 7 Gün — Yakılan Kalori</CardTitle>
        <BarChart data={weekOut} color={c.success} />
      </Card>

      <Card>
        <CardTitle icon="workout" right={<Badge text={`${day.workouts.length} antrenman`} kind="neutral" />}>Bugünün Antrenmanları</CardTitle>
        {day.workouts.length === 0 ? (
          <EmptyNote>Bu tarihte kayıtlı antrenman yok. Antrenman sekmesinden ekleyebilirsin.</EmptyNote>
        ) : (
          day.workouts.map((w, i) => (
            <View key={w.id} style={[s.rowBetween, { paddingVertical: 10, borderBottomWidth: i === day.workouts.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{w.name}</Text>
                <Text style={{ color: c.muted, fontSize: 12, marginTop: 1 }}>{w.exercises.length} hareket · {w.duration} dk</Text>
              </View>
              <View style={[s.row, { gap: 5 }]}>
                <Icon name="flame" size={14} color={c.accent} strokeWidth={2.2} />
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 13, ...tnum }}>{fmt(w.kcal)} kcal</Text>
              </View>
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
