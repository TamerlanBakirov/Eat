/* Antrenman ekranı: antrenman kaydı, hazır programlar, egzersiz kütüphanesi */
import React, { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { useData, useDate, getDay, workoutCalories } from "../lib/store";
import { fmt, parseNum, burnedCalories, round, formatKey } from "../lib/utils";
import {
  Card, CardTitle, StatTile, Btn, IconBtn, EmptyNote, Badge, ExerciseThumb,
  Label, Input, OptionGroup, Sheet, useTheme, s,
} from "../components/ui";
import { Icon } from "../components/icons";
import ExerciseDetailSheet from "../components/ExerciseDetailSheet";
import LiveWorkoutSheet from "../components/LiveWorkoutSheet";
import { radius, tnum } from "../theme";
import DateHeader from "../components/DateHeader";
import { EXERCISE_DB, PROGRAM_TEMPLATES } from "../data/exercises";

const CATEGORIES = ["Tümü", ...new Set(EXERCISE_DB.map((e) => e.cat))];

export default function WorkoutScreen() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const { dateKey } = useDate();
  const [editor, setEditor] = useState(null); // { template } | { blank: true } | null
  const [libCat, setLibCat] = useState("Tümü");
  const [detail, setDetail] = useState(null); // detay sheet'i açık egzersiz
  const [live, setLive] = useState(null); // canlı antrenman seansı
  const [libQuery, setLibQuery] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const day = getDay(state, dateKey);
  const burned = workoutCalories(state, dateKey);
  const totalMin = day.workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const favorites = state.favorites || [];
  const q = libQuery.toLocaleLowerCase("tr");
  const libItems = EXERCISE_DB
    .filter((e) => (libCat === "Tümü" || e.cat === libCat) && (!q || e.name.toLocaleLowerCase("tr").includes(q)))
    .sort((a, b) => (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0));
  const program = state.program;
  const customTemplates = state.customTemplates || [];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
        <DateHeader title="Antrenman" />

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Antrenman" value={String(day.workouts.length)} sub="bugün" icon="workout" color={c.primary} tint={c.primarySoft} />
          <StatTile label="Süre" value={fmt(totalMin)} sub="dakika" icon="clock" color={c.text} />
          <StatTile label="Yakılan" value={fmt(burned)} sub="kcal" color={c.accent} icon="flame" tint={c.accentSoft} />
        </View>

        {program && program.split && (
          <Card>
            <CardTitle icon="target" right={<Badge text={`${program.daysPerWeek} gün/hafta`} kind="primary" />}>
              Antrenman Programım
            </CardTitle>
            <Text style={{ color: c.muted, fontSize: 12.5, marginBottom: 12, lineHeight: 18 }}>
              Sana özel haftalık plan. Bir günü seçip başlat — egzersizler otomatik hazır gelir.
            </Text>
            {program.split.map((d, i) => (
              <View key={d.key} style={{ backgroundColor: c.surface2, borderRadius: radius.md, padding: 13, marginBottom: i === program.split.length - 1 ? 0 : 9 }}>
                <View style={s.rowBetween}>
                  <View style={[s.row, { gap: 10, flex: 1 }]}>
                    <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: c.onPrimary, fontSize: 12, fontWeight: "800" }}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: c.text, fontWeight: "700", fontSize: 14.5, letterSpacing: -0.2 }}>{d.name}</Text>
                      <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1 }}>{d.focus} · {d.exercises.length} hareket</Text>
                    </View>
                  </View>
                  <Btn title="Başlat" icon="workout" small onPress={() => setLive(toSession({ name: d.name, exercises: d.exercises }))} />
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <CardTitle icon="workout" right={
            <View style={[s.row, { gap: 7 }]}>
              <Btn title="Geçmiş" icon="clock" small kind="ghost" onPress={() => setHistoryOpen(true)} />
              <Btn title="Yeni" icon="plus" small onPress={() => setEditor({ blank: true })} />
            </View>
          }>
            Bugünün Antrenmanları
          </CardTitle>
          {day.workouts.length === 0 ? (
            <EmptyNote>Bu tarihte antrenman kaydı yok. Boş bir antrenman başlat veya hazır bir program seç.</EmptyNote>
          ) : (
            day.workouts.map((w, i) => (
              <View key={w.id} style={[s.rowBetween, { paddingVertical: 10, borderBottomWidth: i === day.workouts.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{w.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1 }} numberOfLines={1}>
                    {w.exercises.map((e) => e.name).join(", ")}
                  </Text>
                  <View style={[s.row, { gap: 5, marginTop: 3 }]}>
                    <Text style={{ color: c.muted, fontSize: 11, ...tnum }}>
                      {w.duration} dk · {w.exercises.reduce((sum, e) => sum + (e.sets ? e.sets.length : 0), 0)} set
                    </Text>
                    <Icon name="flame" size={12} color={c.accent} strokeWidth={2.2} />
                    <Text style={{ color: c.muted, fontSize: 11, ...tnum }}>{fmt(w.kcal)} kcal</Text>
                  </View>
                </View>
                <IconBtn name="trash" label="Sil" color={c.faint} size={17} onPress={() => dispatch({ type: "REMOVE_WORKOUT", dateKey, workoutId: w.id })} />
              </View>
            ))
          )}
        </Card>

        {customTemplates.length > 0 && (
          <Card>
            <CardTitle icon="star">Programlarım</CardTitle>
            {customTemplates.map((t) => (
              <View key={t.id} style={{ backgroundColor: c.surface2, borderRadius: radius.md, padding: 13, marginBottom: 10 }}>
                <View style={s.rowBetween}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: "700", fontSize: 14.5, letterSpacing: -0.2 }}>{t.name}</Text>
                    <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>{t.exercises.length} hareket</Text>
                  </View>
                  <View style={[s.row, { gap: 7 }]}>
                    <IconBtn name="trash" label="Sil" color={c.faint} size={17} onPress={() => dispatch({ type: "REMOVE_TEMPLATE", id: t.id })} />
                    <Btn title="Başlat" icon="workout" small onPress={() => setLive(toSession(t))} />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        <Card>
          <CardTitle icon="target">Hazır Programlar</CardTitle>
          {PROGRAM_TEMPLATES.map((t) => (
            <View key={t.id} style={{
              backgroundColor: c.surface2, borderRadius: radius.md,
              padding: 13, marginBottom: 10,
            }}>
              <View style={s.rowBetween}>
                <Text style={{ color: c.text, fontWeight: "700", fontSize: 14.5, letterSpacing: -0.2 }}>{t.name}</Text>
                <View style={[s.row, { gap: 7 }]}>
                  <Btn title="Düzenle" small kind="ghost" onPress={() => setEditor({ template: t })} />
                  <Btn title="Başlat" icon="workout" small onPress={() => setLive(toSession(t))} />
                </View>
              </View>
              <Text style={{ color: c.muted, fontSize: 12, marginTop: 5, lineHeight: 17 }}>{t.desc}</Text>
              <Text style={{ color: c.faint, fontSize: 11, marginTop: 5 }} numberOfLines={2}>
                {t.exercises
                  .map((e) => EXERCISE_DB.find((x) => x.id === e.exerciseId)?.name)
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <CardTitle icon="nutrition">Egzersiz Kütüphanesi</CardTitle>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surface2, borderRadius: radius.sm, paddingHorizontal: 12, marginBottom: 12 }}>
            <Icon name="search" size={17} color={c.faint} strokeWidth={2.2} />
            <Input value={libQuery} onChangeText={setLibQuery} placeholder="Egzersiz ara…" style={{ flex: 1, backgroundColor: "transparent", borderWidth: 0, paddingHorizontal: 0 }} />
            {libQuery ? <Pressable onPress={() => setLibQuery("")} hitSlop={8}><Icon name="close" size={16} color={c.faint} strokeWidth={2.3} /></Pressable> : null}
          </View>
          <View style={{ marginBottom: 12 }}>
            <OptionGroup
              options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
              value={libCat}
              onChange={setLibCat}
            />
          </View>
          {libItems.length === 0 ? (
            <EmptyNote>Sonuç bulunamadı.</EmptyNote>
          ) : libItems.map((e, i) => {
            const fav = favorites.includes(e.id);
            return (
              <Pressable
                key={e.id}
                onPress={() => setDetail(e)}
                style={({ pressed }) => [s.row, { gap: 12, paddingVertical: 9, borderBottomWidth: i === libItems.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border, opacity: pressed ? 0.6 : 1 }]}
              >
                <ExerciseThumb img={e.img} size={52} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{e.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 2 }}>
                    {e.cat} · {e.type === "cardio" ? "Kardiyo" : "Kuvvet"} · MET {e.met}
                  </Text>
                </View>
                <Pressable onPress={() => dispatch({ type: "TOGGLE_FAVORITE", exerciseId: e.id })} hitSlop={10} style={{ padding: 4 }}>
                  <Icon name="star" size={20} color={fav ? c.warning : c.faint} strokeWidth={2} fill={fav ? c.warning : "none"} />
                </Pressable>
              </Pressable>
            );
          })}
        </Card>
      </ScrollView>

      {editor && (
        <WorkoutEditorSheet
          template={editor.template}
          dateKey={dateKey}
          onClose={() => setEditor(null)}
        />
      )}
      {detail && <ExerciseDetailSheet exercise={detail} onClose={() => setDetail(null)} />}
      {live && <LiveWorkoutSheet template={live} dateKey={dateKey} onClose={() => setLive(null)} />}
      <WorkoutHistorySheet
        visible={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestart={(w) => { setHistoryOpen(false); setLive(toSession(workoutToTemplate(w))); }}
      />
    </View>
  );
}

function workoutToTemplate(w) {
  return {
    name: w.name,
    exercises: (w.exercises || []).map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets?.length || 1,
      reps: e.sets?.[0]?.reps || 10,
      duration: e.duration,
    })),
  };
}

/* Tüm antrenman geçmişi — tarih sıralı, tekrar başlat */
function WorkoutHistorySheet({ visible, onClose, onRestart }) {
  const c = useTheme();
  const { state } = useData();
  const all = [];
  Object.entries(state.logs).forEach(([date, day]) => {
    (day.workouts || []).forEach((w) => all.push({ ...w, date }));
  });
  all.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Sheet visible={visible} title="Antrenman Geçmişi" onClose={onClose}>
      {all.length === 0 ? (
        <EmptyNote>Henüz kaydedilmiş antrenman yok.</EmptyNote>
      ) : (
        all.map((w, i) => (
          <View key={w.id || i} style={[s.rowBetween, { paddingVertical: 11, borderBottomWidth: i === all.length - 1 ? 0 : StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: c.text, fontWeight: "700", fontSize: 14 }}>{w.name}</Text>
              <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1, ...tnum }}>
                {formatKey(w.date)} · {w.exercises?.length || 0} hareket · {w.duration} dk · {fmt(w.kcal)} kcal
              </Text>
            </View>
            <Btn title="Başlat" icon="workout" small kind="ghost" onPress={() => onRestart(w)} />
          </View>
        ))
      )}
    </Sheet>
  );
}

/* Şablon/program günü → canlı seans (set dizisi olan biçim) */
function toSession(template) {
  const exercises = (template?.exercises || [])
    .map((te) => {
      const ex = EXERCISE_DB.find((x) => x.id === te.exerciseId);
      return ex ? makeExercise(ex, te.sets, te.reps, te.duration) : null;
    })
    .filter(Boolean);
  return { name: template?.name || "Antrenman", exercises };
}

function makeExercise(ex, sets = 3, reps = 10, duration) {
  return {
    exerciseId: ex.id,
    name: ex.name,
    type: ex.type,
    met: ex.met,
    img: ex.img,
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

  function saveTemplate() {
    if (exercises.length === 0) return;
    const tmpl = {
      id: "custom-" + Date.now().toString(36),
      name: name.trim() || "Şablonum",
      exercises: exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.type === "strength" ? (e.sets.length || 3) : 1,
        reps: e.type === "strength" ? (e.sets[0]?.reps || 10) : 0,
        duration: e.duration,
      })),
    };
    dispatch({ type: "SAVE_TEMPLATE", template: tmpl });
    Alert.alert("Kaydedildi", `"${tmpl.name}" şablonların arasına eklendi.`);
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
      <Btn title="Egzersiz ekle" icon="plus" kind="ghost" onPress={() => setPickerOpen(!pickerOpen)} />

      {pickerOpen && (
        <View style={{
          borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md,
          backgroundColor: c.surface2,
          padding: 12, marginTop: 8,
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
                  flexDirection: "row", alignItems: "center", gap: 10,
                  paddingVertical: 7,
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: c.border,
                  backgroundColor: pressed ? c.primarySoft : "transparent",
                })}
              >
                <ExerciseThumb img={e.img} size={38} rounded={9} />
                <Text style={{ color: c.text, fontSize: 13.5, fontWeight: "600", flex: 1 }}>{e.name}</Text>
                <Icon name="plus" size={17} color={c.primary} strokeWidth={2.4} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {exercises.map((e, ei) => (
        <View key={ei} style={{
          borderColor: c.border, borderWidth: StyleSheet.hairlineWidth, borderRadius: radius.md,
          backgroundColor: c.surface,
          padding: 13, marginTop: 10,
        }}>
          <View style={s.rowBetween}>
            <View style={[s.row, { gap: 10, flex: 1 }]}>
              <ExerciseThumb img={e.img} size={40} rounded={10} />
              <Text style={{ color: c.text, fontWeight: "700", fontSize: 14, flex: 1 }}>{e.name}</Text>
            </View>
            <IconBtn name="trash" label="Egzersizi kaldır" color={c.faint} size={17} onPress={() => update((next) => next.splice(ei, 1))} />
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
                    style={{ flex: 1, minWidth: 0, paddingVertical: 6, paddingHorizontal: 8 }}
                    keyboardType="numeric"
                    defaultValue={String(set.reps)}
                    onChangeText={(t) => update((next) => { next[ei].sets[si].reps = parseNum(t); })}
                  />
                  <Input
                    style={{ flex: 1, minWidth: 0, paddingVertical: 6, paddingHorizontal: 8 }}
                    keyboardType="numeric"
                    defaultValue={String(set.weight)}
                    onChangeText={(t) => update((next) => { next[ei].sets[si].weight = parseNum(t); })}
                  />
                  <IconBtn name="close" label="Seti kaldır" color={c.faint} size={16} onPress={() => update((next) => next[ei].sets.splice(si, 1))} />
                </View>
              ))}
              <Btn
                title="Set ekle"
                icon="plus"
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
        <View style={[s.row, { gap: 8, marginTop: 14, backgroundColor: c.accentSoft, borderRadius: radius.md, padding: 12 }]}>
          <Icon name="flame" size={18} color={c.accent} strokeWidth={2.2} />
          <Text style={{ color: c.text, fontSize: 12.5, flex: 1 }}>
            Tahmini yakım: <Text style={{ fontWeight: "800", ...tnum }}>{fmt(estKcal)} kcal</Text>
            <Text style={{ color: c.muted }}>  · ort. MET {fmt(round(avgMet, 1), 1)}, {fmt(state.profile.weight)} kg</Text>
          </Text>
        </View>
      )}

      <View style={{ height: 14 }} />
      <Btn title="Antrenmanı Kaydet" kind="success" onPress={save} />
      {exercises.length > 0 && (
        <>
          <View style={{ height: 10 }} />
          <Btn title="Şablon Olarak Kaydet" icon="star" kind="ghost" onPress={saveTemplate} />
        </>
      )}
    </Sheet>
  );
}
