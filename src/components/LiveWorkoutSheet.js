/* Canlı antrenman modu — rehberli seans: set tamamla, otomatik dinlenme, süre otomatik, kaydet. */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useData } from "../lib/store";
import { burnedCalories, fmt } from "../lib/utils";
import { useTheme, Btn, Input, ExerciseThumb, s } from "./ui";
import { Icon } from "./icons";
import RestTimer from "./RestTimer";
import { radius, tnum } from "../theme";

function tick() { if (Platform.OS !== "web") { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {} } }

export default function LiveWorkoutSheet({ template, dateKey, onClose }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useData();

  const [name] = useState(template?.name || "Antrenman");
  const [rest, setRest] = useState(false);
  const [restSec, setRestSec] = useState(90);
  const [elapsed, setElapsed] = useState(0);

  // Seans egzersizleri: her set için done bayrağı
  const [items, setItems] = useState(() =>
    (template?.exercises || []).map((e) => ({
      exerciseId: e.exerciseId, name: e.name, type: e.type, met: e.met, img: e.img,
      duration: e.duration || 10,
      rest: e.rest || 90,
      done: e.type !== "strength" ? false : undefined,
      sets: (e.sets || []).map((sset) => ({ reps: sset.reps, weight: sset.weight, done: false })),
    }))
  );

  useEffect(() => {
    const id = setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSets = useMemo(() => items.reduce((n, e) => n + (e.type === "strength" ? e.sets.length : 1), 0), [items]);
  const doneSets = useMemo(() => items.reduce((n, e) => n + (e.type === "strength" ? e.sets.filter((x) => x.done).length : (e.done ? 1 : 0)), 0), [items]);

  const avgMet = items.length ? items.reduce((s, e) => s + e.met, 0) / items.length : 0;
  const mins = Math.max(1, Math.round(elapsed / 60));
  const estKcal = burnedCalories(avgMet, state.profile.weight, mins);

  function upd(fn) { setItems((prev) => { const n = structuredClone(prev); fn(n); return n; }); }

  function toggleSet(ei, si) {
    upd((n) => { n[ei].sets[si].done = !n[ei].sets[si].done; });
    const wasDone = items[ei].sets[si].done;
    if (!wasDone) { tick(); setRestSec(items[ei].rest || 90); setRest(true); }
  }
  function cycleRest(ei) {
    const opts = [60, 90, 120, 150, 180];
    upd((n) => { const cur = n[ei].rest || 90; n[ei].rest = opts[(opts.indexOf(cur) + 1) % opts.length]; });
  }
  function toggleCardio(ei) {
    upd((n) => { n[ei].done = !n[ei].done; });
    if (!items[ei].done) tick();
  }

  function finish() {
    const exercises = items.map((e) => ({
      exerciseId: e.exerciseId, name: e.name, type: e.type, met: e.met, img: e.img,
      duration: e.duration,
      sets: e.type === "strength" ? e.sets.map((x) => ({ reps: x.reps, weight: x.weight })) : [],
    }));
    dispatch({ type: "ADD_WORKOUT", dateKey, workout: { name, duration: mins, exercises, kcal: estKcal } });
    if (Platform.OS !== "web") { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} }
    onClose();
  }

  function confirmClose() {
    if (doneSets === 0) { onClose(); return; }
    Alert.alert("Antrenmandan çık", "Kaydetmeden çıkmak istediğine emin misin?", [
      { text: "Devam et", style: "cancel" },
      { text: "Çık", style: "destructive", onPress: onClose },
    ]);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ssv = String(elapsed % 60).padStart(2, "0");

  return (
    <Modal visible animationType="slide" onRequestClose={confirmClose}>
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        {/* Üst bar */}
        <View style={[s.rowBetween, { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: c.border }]}>
          <Pressable onPress={confirmClose} hitSlop={10} style={{ width: 38, height: 38, borderRadius: radius.sm, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
            <Icon name="chevronLeft" size={22} color={c.text} strokeWidth={2.4} />
          </Pressable>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: c.text, fontSize: 16, fontWeight: "800" }} numberOfLines={1}>{name}</Text>
            <Text style={{ color: c.muted, fontSize: 12, ...tnum }}>{doneSets}/{totalSets} set · {fmt(estKcal)} kcal</Text>
          </View>
          <View style={{ backgroundColor: c.primarySoft, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6, minWidth: 62, alignItems: "center" }}>
            <Text style={{ color: c.primary, fontSize: 15, fontWeight: "800", ...tnum }}>{mm}:{ssv}</Text>
          </View>
        </View>

        {/* İlerleme */}
        <View style={{ height: 3, backgroundColor: c.surface2 }}>
          <View style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%`, height: "100%", backgroundColor: c.primary }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          {items.map((e, ei) => (
            <View key={ei} style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: c.border }}>
              <View style={[s.row, { gap: 12, marginBottom: e.type === "strength" ? 12 : 0 }]}>
                <ExerciseThumb img={e.img} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 15, fontWeight: "700" }}>{e.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 1 }}>
                    {e.type === "strength" ? `${e.sets.length} set` : `${e.duration} dk kardiyo`}
                  </Text>
                </View>
                {e.type === "strength" && (
                  <Pressable onPress={() => cycleRest(ei)} accessibilityLabel="Dinlenme süresi" style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: c.surface2, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 6 }}>
                    <Icon name="clock" size={14} color={c.muted} strokeWidth={2.2} />
                    <Text style={{ color: c.text, fontSize: 12.5, fontWeight: "700", ...tnum }}>{e.rest}sn</Text>
                  </Pressable>
                )}
              </View>

              {e.type === "strength" ? (
                <>
                  <View style={[s.row, { gap: 8, marginBottom: 4, paddingHorizontal: 2 }]}>
                    <Text style={{ color: c.muted, fontSize: 11, width: 34 }}>Set</Text>
                    <Text style={{ color: c.muted, fontSize: 11, flex: 1, textAlign: "center" }}>Tekrar</Text>
                    <Text style={{ color: c.muted, fontSize: 11, flex: 1, textAlign: "center" }}>Kg</Text>
                    <View style={{ width: 40 }} />
                  </View>
                  {e.sets.map((sset, si) => (
                    <View key={si} style={[s.row, { gap: 8, marginBottom: 7, opacity: sset.done ? 0.55 : 1 }]}>
                      <View style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: sset.done ? c.successSoft : c.surface2, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: sset.done ? c.success : c.text, fontWeight: "800", fontSize: 13 }}>{si + 1}</Text>
                      </View>
                      <Input style={{ flex: 1, minWidth: 0, paddingVertical: 7, paddingHorizontal: 6, textAlign: "center" }} keyboardType="numeric" defaultValue={String(sset.reps)} onChangeText={(t) => upd((n) => { n[ei].sets[si].reps = parseInt(t) || 0; })} />
                      <Input style={{ flex: 1, minWidth: 0, paddingVertical: 7, paddingHorizontal: 6, textAlign: "center" }} keyboardType="numeric" defaultValue={String(sset.weight)} onChangeText={(t) => upd((n) => { n[ei].sets[si].weight = parseFloat(String(t).replace(",", ".")) || 0; })} />
                      <Pressable onPress={() => toggleSet(ei, si)} style={{ width: 40, height: 40, borderRadius: radius.sm, backgroundColor: sset.done ? c.success : c.surface2, alignItems: "center", justifyContent: "center" }}>
                        <Icon name="check" size={20} color={sset.done ? "#fff" : c.faint} strokeWidth={2.6} />
                      </Pressable>
                    </View>
                  ))}
                  <Pressable onPress={() => upd((n) => { const last = n[ei].sets[n[ei].sets.length - 1]; n[ei].sets.push({ reps: last ? last.reps : 10, weight: last ? last.weight : 0, done: false }); })} style={{ marginTop: 4, paddingVertical: 8, alignItems: "center" }}>
                    <Text style={{ color: c.primary, fontWeight: "700", fontSize: 13 }}>+ Set ekle</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable onPress={() => toggleCardio(ei)} style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: radius.sm, backgroundColor: e.done ? c.success : c.surface2 }}>
                  <Icon name="check" size={19} color={e.done ? "#fff" : c.faint} strokeWidth={2.6} />
                  <Text style={{ color: e.done ? "#fff" : c.text, fontWeight: "700", fontSize: 14 }}>{e.done ? "Tamamlandı" : "Tamamlandı olarak işaretle"}</Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Alt bitir barı */}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 12, backgroundColor: c.surface, borderTopWidth: 0.5, borderTopColor: c.border }}>
          <Btn title="Antrenmanı Bitir" icon="check" kind="success" onPress={finish} style={{ paddingVertical: 15 }} />
        </View>

        {rest && <RestTimer seconds={restSec} onClose={() => setRest(false)} />}
      </View>
    </Modal>
  );
}
