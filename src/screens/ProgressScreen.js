/* İlerleme ekranı: kilo grafiği, 14 günlük trendler, kişisel rekorlar, seri */
import React, { useState } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useData, useDate, nutritionTotals, workoutCalories, personalRecords } from "../lib/store";
import {
  macroTargets, fmt, lastNDays, keyToDate, todayKey, shiftKey,
  bmi, bmiLabel, formatKey, parseNum,
} from "../lib/utils";
import {
  Card, CardTitle, StatTile, Btn, IconBtn, Badge, EmptyNote,
  Label, Input, Sheet, useTheme, s,
} from "../components/ui";
import { Icon } from "../components/icons";
import { Segmented } from "../components/ios";
import { MeasurementsCard, ProgressPhotosCard, ActivityHeatmap } from "../components/ProgressExtras";
import ShareCard from "../components/ShareCard";
import { computeBadges, weeklyReport } from "../lib/achievements";
import { radius, tnum } from "../theme";
import { BarChart, LineChart } from "../components/charts";
import DateHeader from "../components/DateHeader";

export default function ProgressScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [weightOpen, setWeightOpen] = useState(false);
  const [range, setRange] = useState(14);

  const profile = state.profile;
  const targets = macroTargets(profile);
  const weights = state.weights;
  const badges = computeBadges(state);
  const earnedCount = badges.filter((b) => b.earned).length;
  const report = weeklyReport(state, dateKey);

  const rangeKeys = lastNDays(range, dateKey);
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <DateHeader title="İlerleme" showDate={false} />

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Seri" value={`${streak}`} sub="gün kesintisiz" icon="flame" color={c.accent} tint={c.accentSoft} />
          <StatTile label="Antrenman" value={String(totalWorkouts)} sub="tüm zamanlar" icon="workout" color={c.primary} tint={c.primarySoft} />
          <StatTile
            label="Kilo"
            value={`${fmt(profile.weight, 1)}`}
            sub={`BMI ${fmt(bmiVal, 1)}`}
            icon="scale"
            color={c.text}
          />
        </View>

        <Card>
          <CardTitle icon="clock">Haftalık Rapor</CardTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <ReportCell c={c} label="Aktif gün" value={`${report.activeDays}/7`} icon="flame" tint={c.accent} bg={c.accentSoft} />
            <ReportCell c={c} label="Antrenman" value={String(report.workouts)} icon="workout" tint={c.primary} bg={c.primarySoft} />
            <ReportCell c={c} label="Ort. kalori" value={fmt(report.avgKcal)} icon="nutrition" tint={c.success} bg={c.successSoft} />
            <ReportCell c={c} label="Yakılan" value={fmt(report.burned)} icon="flame" tint={c.accent} bg={c.accentSoft} />
            <ReportCell c={c} label="Ort. su" value={`${fmt(report.avgWater, 1)} bardak`} icon="droplet" tint={c.primary} bg={c.primarySoft} />
            <ReportCell c={c} label="Hedef" value={`${fmt(report.target)} kcal`} icon="target" tint={c.text} bg={c.surface2} />
          </View>
        </Card>

        <Card>
          <CardTitle icon="target" right={<Badge text={`${earnedCount}/${badges.length}`} kind="primary" />}>
            Rozetler
          </CardTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {badges.map((b) => (
              <View key={b.id} style={{ width: "31%", alignItems: "center", opacity: b.earned ? 1 : 0.45 }}>
                <View style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: b.earned ? c.primary : c.surface2, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                  <Icon name={b.icon} size={26} color={b.earned ? c.onPrimary : c.faint} strokeWidth={2.2} />
                </View>
                <Text style={{ color: c.text, fontSize: 11.5, fontWeight: "700", textAlign: "center" }} numberOfLines={1}>{b.name}</Text>
                <Text style={{ color: c.muted, fontSize: 9.5, textAlign: "center", marginTop: 1 }} numberOfLines={2}>{b.desc}</Text>
                {!b.earned && b.progress != null && (
                  <View style={{ width: "80%", height: 3, borderRadius: 999, backgroundColor: c.surface2, marginTop: 4, overflow: "hidden" }}>
                    <View style={{ width: `${b.progress * 100}%`, height: "100%", backgroundColor: c.primary }} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </Card>

        <ShareCard dateKey={dateKey} />

        <ActivityHeatmap />

        <MeasurementsCard />

        <ProgressPhotosCard />

        <View style={{ marginBottom: 12 }}>
          <Segmented
            options={[{ value: 7, label: "7 gün" }, { value: 14, label: "14 gün" }, { value: 30, label: "30 gün" }]}
            value={range}
            onChange={setRange}
          />
        </View>

        <Card>
          <CardTitle icon="scale" right={<Btn title="Kilo Ekle" icon="plus" small onPress={() => setWeightOpen(true)} />}>
            Kilo Takibi
          </CardTitle>
          <LineChart data={weightData} color={c.primary} />
          {wDiff != null && (
            <View style={[s.row, { gap: 8, marginTop: 8 }]}>
              <Badge
                text={`${wDiff > 0 ? "+" : ""}${fmt(wDiff, 1)} kg`}
                kind={wDiff <= 0 ? "success" : "warning"}
              />
              <Text style={{ color: c.muted, fontSize: 12, ...tnum }}>
                {formatKey(weights[0].date)} → {formatKey(weights[weights.length - 1].date)}
              </Text>
            </View>
          )}
        </Card>

        <Card>
          <CardTitle icon="flame">{`Son ${range} Gün — Alınan Kalori`}</CardTitle>
          <BarChart data={kcalData} target={targets.kcal} height={150} />
        </Card>

        <Card>
          <CardTitle icon="workout">{`Son ${range} Gün — Yakılan Kalori`}</CardTitle>
          <BarChart data={burnData} color={c.success} height={150} />
        </Card>

        <Card>
          <CardTitle icon="target">Kişisel Rekorlar</CardTitle>
          {prs.length === 0 ? (
            <EmptyNote>Ağırlıklı antrenman kaydettikçe rekorların burada görünecek.</EmptyNote>
          ) : (
            prs.map(([exName, pr], i) => (
              <View key={exName} style={[s.rowBetween, { paddingVertical: 9, borderBottomWidth: i === prs.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 13.5 }}>{exName}</Text>
                  <Text style={{ color: c.muted, fontSize: 11, marginTop: 1, ...tnum }}>{formatKey(pr.date)}</Text>
                </View>
                <Text style={{ color: c.primary, fontWeight: "800", fontSize: 14, ...tnum }}>
                  {fmt(pr.weight, 1)} kg × {pr.reps}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Card>
          <CardTitle icon="scale">Kilo Kayıtları</CardTitle>
          {weights.length === 0 ? (
            <EmptyNote>Henüz kilo kaydı yok.</EmptyNote>
          ) : (
            weights.slice().reverse().slice(0, 10).map((w, i, arr) => (
              <View key={w.date} style={[s.rowBetween, { paddingVertical: 9, borderBottomWidth: i === arr.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
                <View>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 13.5, ...tnum }}>{fmt(w.kg, 1)} kg</Text>
                  <Text style={{ color: c.muted, fontSize: 11, marginTop: 1, ...tnum }}>{formatKey(w.date)}</Text>
                </View>
                <IconBtn name="trash" label="Kaydı sil" color={c.faint} size={17} onPress={() => dispatch({ type: "REMOVE_WEIGHT", dateKey: w.date })} />
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

function ReportCell({ c, label, value, icon, tint, bg }) {
  return (
    <View style={{ width: "47%", flexGrow: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface2, borderRadius: radius.md, padding: 12 }}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={17} color={tint} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: c.text, fontSize: 15, fontWeight: "800", ...tnum }} numberOfLines={1}>{value}</Text>
        <Text style={{ color: c.muted, fontSize: 11, fontWeight: "600" }} numberOfLines={1}>{label}</Text>
      </View>
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
