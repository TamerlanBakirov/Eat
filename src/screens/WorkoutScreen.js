/* Antrenman ekranı: antrenman kaydı, hazır programlar, egzersiz kütüphanesi */
import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useData, useDate, getDay, workoutCalories } from "../lib/store";
import { fmt, parseNum, burnedCalories, round } from "../lib/utils";
import {
  Card, CardTitle, StatTile, Btn, IconBtn, EmptyNote,
  Label, Input, OptionGroup, Sheet, useTheme, s,
} from "../components/ui";
import DateHeader from "../components/DateHeader";
import { EXERCISE_DB, PROGRAM_TEMPLATES } from "../data/exercises";

const CATEGORIES = ["Tümü", ...new Set(EXERCISE_DB.map((e) => e.cat))];

export default function WorkoutScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [editor, setEditor] = useState(null); // { template } | { blank: true } | null
  const [libCat, setLibCat] = useState("Tümü");

  const day = getDay(state, dateKey);
  const burned = workoutCalories(state, dateKey);
  const totalMin = day.workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const libItems = libCat === "Tümü" ? EXERCISE_DB : EXERCISE_DB.filter((e) => e.cat === libCat);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DateHeader title="Antrenman" />

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Antrenman" value={String(day.workouts.length)} sub="bugün" />
          <StatTile label="Süre" value={fmt(totalMin)} sub="dakika" />
          <StatTile label="Yakılan" value={fmt(burned)} sub="kcal" color={c.success} />
        </View>

        <Card>
          <CardTitle right={<Btn title="+ Yeni" small onPress={() => setEditor({ blank: true })} />}>
            Bugünün Antrenmanları
          </CardTitle>
          {day.workouts.length === 0 ? (
            <EmptyNote>Bu tarihte antrenman kaydı yok. Boş bir antrenman başlat veya hazır bir program seç. 💪</EmptyNote>
          ) : (
            day.workouts.map((w) => (
              <View key={w.id} style={[s.rowBetween, { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: "600", fontSize: 14 }}>{w.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11 }} numberOfLines={1}>
                    {w.exercises.map((e) => e.name).join(", ")}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 11 }}>
                    {w.duration} dk · {w.exercises.reduce((sum, e) => sum + (e.sets ? e.sets.length : 0), 0)} set · 🔥 {fmt(w.kcal)} kcal
                  </Text>
                </View>
                <IconBtn label="🗑" onPress={() => dispatch({ type: "REMOVE_WORKOUT", dateKey, workoutId: w.id })} />
              </View>
            ))
          )}
        </Card>

        <Card>
          <CardTitle>Hazır Programlar</CardTitle>
          {PROGRAM_TEMPLATES.map((t) => (
            <View key={t.id} style={{
              borderColor: c.border, borderWidth: 1, borderRadius: 10,
              padding: 12, marginBottom: 10,
            }}>
              <View style={s.rowBetween}>
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{t.name}</Text>
                <Btn title="Başlat" small kind="ghost" onPress={() => setEditor({ template: t })} />
              </View>
              <Text style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>{t.desc}</Text>
              <Text style={{ color: c.muted, fontSize: 11, marginTop: 4 }} numberOfLines={2}>
                {t.exercises
                  .map((e) => EXERCISE_DB.find((x) => x.id === e.exerciseId)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <CardTitle>Egzersiz Kütüphanesi</CardTitle>
          <View style={{ marginBottom: 10 }}>
            <OptionGroup
              options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
              value={libCat}
              onChange={setLibCat}
            />
          </View>
          {libItems.map((e) => (
            <View key={e.id} style={{ paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <Text style={{ color: c.text, fontWeight: "600", fontSize: 13 }}>{e.name}</Text>
              <Text style={{ color: c.muted, fontSize: 11 }}>
                {e.cat} · {e.type === "cardio" ? "Kardiyo" : "Kuvvet"} · MET {e.met}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>

      {editor && (
        <WorkoutEditorSheet
          template={editor.template}
          dateKey={dateKey}
          onClose={() => setEditor(null)}
        />
      )}
    </View>
  );
}

function makeExercise(ex, sets = 3, reps = 10, duration) {
  return {
    exerciseId: ex.id,
    name: ex.name,
    type: ex.type,
    met: ex.met,
    duration: duration || 10, // kardiyo için dk
    sets: ex.type === "strength"
      ? Array.from({ length: sets }, () => ({ reps, weight: 0 }))
      : [],
  };
}

/* Antrenman düzenleme sheet'i — şablonla veya boş başlar */
function WorkoutEditorSheet({ template, dateKey, onClose }) {
  const c = useTheme();
  const { state, dispatch } = useData();
  const [name, setName] = useState(template ? template.name : "Serbest Antrenman");
  const [duration, setDuration] = useState("45");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerCat, setPickerCat] = useState(CATEGORIES[1]);
  const [exercises, setExercises] = useState(() =>
    (template ? template.exercises : [])
      .map((te) => {
        const ex = EXERCISE_DB.find((x) => x.id === te.exerciseId);
        return ex ? makeExercise(ex, te.sets, te.reps, te.duration) : null;
      })
      .filter(Boolean)
  );

  const mins = parseNum(duration);
  const avgMet = exercises.length
    ? exercises.reduce((sum, e) => sum + e.met, 0) / exercises.length
    : 0;
  const estKcal = exercises.length && mins > 0
    ? burnedCalories(avgMet, state.profile.weight, mins)
    : 0;

  function update(fn) {
    setExercises((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  function save() {
    if (exercises.length === 0 || mins <= 0) return;
    dispatch({
      type: "ADD_WORKOUT",
      dateKey,
      workout: { name: name.trim() || "Antrenman", duration: mins, exercises, kcal: estKcal },
    });
    onClose();
  }

  return (
    <Sheet visible title="Antrenman Kaydet" onClose={onClose}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 2 }}>
          <Label>Antrenman adı</Label>
          <Input value={name} onChangeText={setName} />
        </View>
        <View style={{ flex: 1 }}>
          <Label>Süre (dk)</Label>
          <Input value={duration} onChangeText={setDuration} keyboardType="numeric" />
        </View>
      </View>

      <View style={{ height: 12 }} />
      <Btn title="+ Egzersiz ekle" kind="ghost" onPress={() => setPickerOpen(!pickerOpen)} />

      {pickerOpen && (
        <View style={{
          borderColor: c.border, borderWidth: 1, borderRadius: 10,
          padding: 10, marginTop: 8,
        }}>
          <OptionGroup
            options={CATEGORIES.slice(1).map((cat) => ({ value: cat, label: cat }))}
            value={pickerCat}
            onChange={setPickerCat}
          />
          <View style={{ marginTop: 8 }}>
            {EXERCISE_DB.filter((e) => e.cat === pickerCat).map((e) => (
              <Pressable
                key={e.id}
                onPress={() => {
                  update((next) => next.push(makeExercise(e)));
                  setPickerOpen(false);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: c.border,
                  backgroundColor: pressed ? c.primarySoft : "transparent",
                })}
              >
                <Text style={{ color: c.text, fontSize: 13, fontWeight: "600" }}>{e.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {exercises.map((e, ei) => (
        <View key={ei} style={{
          borderColor: c.border, borderWidth: 1, borderRadius: 10,
          padding: 12, marginTop: 10,
        }}>
          <View style={s.rowBetween}>
            <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{e.name}</Text>
            <IconBtn label="🗑" onPress={() => update((next) => next.splice(ei, 1))} />
          </View>

          {e.type === "strength" ? (
            <View style={{ marginTop: 8 }}>
              <View style={[s.row, { gap: 8, marginBottom: 4 }]}>
                <Text style={{ color: c.muted, fontSize: 11, width: 30 }}>Set</Text>
                <Text style={{ color: c.muted, fontSize: 11, flex: 1 }}>Tekrar</Text>
                <Text style={{ color: c.muted, fontSize: 11, flex: 1 }}>Ağırlık (kg)</Text>
                <View style={{ width: 28 }} />
              </View>
              {e.sets.map((set, si) => (
                <View key={si} style={[s.row, { gap: 8, marginBottom: 6 }]}>
                  <View style={{
                    width: 30, height: 30, borderRadius: 999,
                    backgroundColor: c.surface2,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Text style={{ color: c.text, fontWeight: "700", fontSize: 12 }}>{si + 1}</Text>
                  </View>
                  <Input
                    style={{ flex: 1, paddingVertical: 6 }}
                    keyboardType="numeric"
                    defaultValue={String(set.reps)}
                    onChangeText={(t) => update((next) => { next[ei].sets[si].reps = parseNum(t); })}
                  />
                  <Input
                    style={{ flex: 1, paddingVertical: 6 }}
                    keyboardType="numeric"
                    defaultValue={String(set.weight)}
                    onChangeText={(t) => update((next) => { next[ei].sets[si].weight = parseNum(t); })}
                  />
                  <IconBtn label="✕" onPress={() => update((next) => next[ei].sets.splice(si, 1))} />
                </View>
              ))}
              <Btn
                title="+ Set ekle"
                small kind="ghost"
                onPress={() => update((next) => {
                  const sets = next[ei].sets;
                  const last = sets[sets.length - 1];
                  sets.push({ reps: last ? last.reps : 10, weight: last ? last.weight : 0 });
                })}
              />
            </View>
          ) : (
            <View style={{ marginTop: 8 }}>
              <Label>Süre (dk)</Label>
              <Input
                keyboardType="numeric"
                defaultValue={String(e.duration)}
                onChangeText={(t) => update((next) => { next[ei].duration = parseNum(t); })}
              />
            </View>
          )}
        </View>
      ))}

      {estKcal > 0 && (
        <Text style={{ color: c.muted, fontSize: 12, marginTop: 12 }}>
          Tahmini yakım: <Text style={{ color: c.text, fontWeight: "800" }}>🔥 {fmt(estKcal)} kcal</Text>
          {"  "}(ortalama MET {fmt(round(avgMet, 1), 1)}, {fmt(state.profile.weight)} kg)
        </Text>
      )}

      <View style={{ height: 14 }} />
      <Btn title="Antrenmanı Kaydet" kind="success" onPress={save} />
    </Sheet>
  );
}
