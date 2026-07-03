/* İlerleme ekranı: kilo grafiği, 14 günlük trendler, kişisel rekorlar, seri */
import React, { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { useData, useDate, nutritionTotals, workoutCalories, personalRecords } from "../lib/store";
import {
  macroTargets, fmt, lastNDays, keyToDate, todayKey, shiftKey,
  bmi, bmiLabel, formatKey, parseNum,
} from "../lib/utils";
import {
  Card, CardTitle, StatTile, Btn, IconBtn, Badge, EmptyNote,
  Label, Input, Sheet, useTheme, s,
} from "../components/ui";
import { BarChart, LineChart } from "../components/charts";
import DateHeader from "../components/DateHeader";

export default function ProgressScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [weightOpen, setWeightOpen] = useState(false);

  const profile = state.profile;
  const targets = macroTargets(profile);
  const weights = state.weights;

  const rangeKeys = lastNDays(14, dateKey);
  const kcalData = rangeKeys.map((k) => ({
    label: String(keyToDate(k).getDate()),
    value: Math.round(nutritionTotals(state, k).kcal),
  }));
  const burnData = rangeKeys.map((k) => ({
    label: String(keyToDate(k).getDate()),
    value: workoutCalories(state, k),
  }));
  const weightData = weights.slice(-14).map((w) => ({
    label: String(keyToDate(w.date).getDate()),
    value: w.kg,
  }));

  const prs = Object.entries(personalRecords(state)).sort((a, b) => b[1].weight - a[1].weight);

  // Seri: bugünden geriye kesintisiz kayıtlı gün sayısı
  let streak = 0;
  let cursor = todayKey();
  while (hasActivity(state, cursor)) { streak++; cursor = shiftKey(cursor, -1); }

  const totalWorkouts = Object.values(state.logs)
    .reduce((sum, d) => sum + (d.workouts ? d.workouts.length : 0), 0);

  const bmiVal = bmi(profile);
  const wDiff = weights.length > 1 ? weights[weights.length - 1].kg - weights[0].kg : null;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DateHeader title="İlerleme" showDate={false} />

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Seri" value={`${streak} gün`} sub="kesintisiz kayıt" />
          <StatTile label="Antrenman" value={String(totalWorkouts)} sub="tüm zamanlar" />
          <StatTile
            label="Kilo"
            value={`${fmt(profile.weight, 1)}`}
            sub={`BMI ${fmt(bmiVal, 1)} · ${bmiLabel(bmiVal)}`}
          />
        </View>

        <Card>
          <CardTitle right={<Btn title="+ Kilo Kaydet" small onPress={() => setWeightOpen(true)} />}>
            Kilo Takibi
          </CardTitle>
          <LineChart data={weightData} color={c.success} />
          {wDiff != null && (
            <View style={[s.row, { gap: 8, marginTop: 8 }]}>
              <Badge
                text={`${wDiff > 0 ? "+" : ""}${fmt(wDiff, 1)} kg`}
                kind={wDiff <= 0 ? "success" : "warning"}
              />
              <Text style={{ color: c.muted, fontSize: 12 }}>
                {formatKey(weights[0].date)} → {formatKey(weights[weights.length - 1].date)}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <CardTitle>Son 14 Gün — Alınan Kalori</CardTitle>
          <BarChart data={kcalData} target={targets.kcal} height={150} />
        </Card>

        <Card>
          <CardTitle>Son 14 Gün — Yakılan Kalori</CardTitle>
          <BarChart data={burnData} color={c.success} height={150} />
        </Card>

        <Card>
          <CardTitle>Kişisel Rekorlar 🏆</CardTitle>
          {prs.length === 0 ? (
            <EmptyNote>Ağırlıklı antrenman kaydettikçe rekorların burada görünecek.</EmptyNote>
          ) : (
            prs.map(([exName, pr]) => (
              <View key={exName} style={[s.rowBetween, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 13 }}>{exName}</Text>
                  <Text style={{ color: c.muted, fontSize: 11 }}>{formatKey(pr.date)}</Text>
                </View>
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 13 }}>
                  {fmt(pr.weight, 1)} kg × {pr.reps}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>Kilo Kayıtları</CardTitle>
          {weights.length === 0 ? (
            <EmptyNote>Henüz kilo kaydı yok.</EmptyNote>
          ) : (
            weights.slice().reverse().slice(0, 10).map((w) => (
              <View key={w.date} style={[s.rowBetween, { paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View>
                  <Text style={{ color: c.text, fontWeight: "600", fontSize: 13 }}>{fmt(w.kg, 1)} kg</Text>
                  <Text style={{ color: c.muted, fontSize: 11 }}>{formatKey(w.date)}</Text>
                </View>
                <IconBtn label="🗑" onPress={() => dispatch({ type: "REMOVE_WEIGHT", dateKey: w.date })} />
              </View>
            ))
          )}
        </Card>
      </ScrollView>

      <WeightSheet
        visible={weightOpen}
        dateKey={dateKey}
        initial={profile.weight}
        onClose={() => setWeightOpen(false)}
      />
    </View>
  );
}

function hasActivity(state, dateKey) {
  const day = state.logs[dateKey];
  if (!day) return false;
  const hasFood = day.meals && Object.values(day.meals).some((m) => m.length > 0);
  const hasWorkout = day.workouts && day.workouts.length > 0;
  return hasFood || hasWorkout;
}

function WeightSheet({ visible, dateKey, initial, onClose }) {
  const c = useTheme();
  const { dispatch } = useData();
  const [kg, setKg] = useState(String(initial));

  function save() {
    const v = parseNum(kg);
    if (v < 20 || v > 400) return;
    dispatch({ type: "ADD_WEIGHT", dateKey, kg: v });
    onClose();
  }

  return (
    <Sheet visible={visible} title="Kilo Kaydet" onClose={onClose}>
      <Text style={{ color: c.muted, fontSize: 13, marginBottom: 10 }}>
        Tarih: <Text style={{ color: c.text, fontWeight: "700" }}>{formatKey(dateKey)}</Text>
      </Text>
      <Label>Kilo (kg)</Label>
      <Input value={kg} onChangeText={setKg} keyboardType="numeric" autoFocus />
      <View style={{ height: 14 }} />
      <Btn title="Kaydet" onPress={save} />
    </Sheet>
  );
}
