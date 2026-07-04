/* Egzersiz detay sayfası — 2 görsel, hedef kaslar, ekipman, adım adım anlatım. */
import React, { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useData } from "../lib/store";
import { fmt, formatKey } from "../lib/utils";
import { Sheet, Badge, useTheme, s } from "./ui";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";
import { EXERCISE_DETAILS, muscleTR, equipTR, secondImage } from "../data/exerciseDetails";

/* Bu egzersiz için kayıtlardan istatistik: PR, tahmini 1RM (Epley), toplam hacim/set */
function useExerciseStats(id) {
  const { state } = useData();
  let best = null, volume = 0, sets = 0;
  Object.entries(state.logs).forEach(([date, day]) => {
    (day.workouts || []).forEach((w) => {
      (w.exercises || []).forEach((ex) => {
        if (ex.exerciseId !== id) return;
        (ex.sets || []).forEach((st) => {
          sets++;
          volume += (st.weight || 0) * (st.reps || 0);
          if (st.weight && (!best || st.weight > best.weight)) best = { weight: st.weight, reps: st.reps, date };
        });
      });
    });
  });
  const orm = best ? Math.round(best.weight * (1 + (best.reps || 0) / 30)) : 0;
  return { best, orm, volume: Math.round(volume), sets };
}

export default function ExerciseDetailSheet({ exercise, onClose }) {
  const c = useTheme();
  const [idx, setIdx] = useState(0);
  const stats = useExerciseStats(exercise?.id);
  if (!exercise) return null;
  const d = EXERCISE_DETAILS[exercise.id] || {};
  const img2 = secondImage(exercise.img);
  const images = [exercise.img, img2].filter(Boolean);
  const shown = images[idx] || exercise.img;
  const muscles = [d.primary, ...(d.secondary || [])].filter(Boolean);

  return (
    <Sheet visible title={exercise.name} onClose={onClose}>
      {exercise.img ? (
        <>
          <Image
            source={{ uri: shown }}
            resizeMode="cover"
            style={{ width: "100%", height: 220, borderRadius: radius.md, backgroundColor: "#fff" }}
          />
          {images.length > 1 && (
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {images.map((_, i) => (
                <Pressable key={i} onPress={() => setIdx(i)} hitSlop={8}>
                  <View style={{ width: idx === i ? 20 : 7, height: 7, borderRadius: 999, backgroundColor: idx === i ? c.primary : c.surface3 }} />
                </Pressable>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={{ height: 160, borderRadius: radius.md, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
          <Icon name="workout" size={44} color={c.faint} strokeWidth={1.8} />
        </View>
      )}

      {/* Etiketler */}
      <View style={[s.row, { gap: 7, flexWrap: "wrap", marginTop: 16 }]}>
        <Badge text={exercise.type === "cardio" ? "Kardiyo" : "Kuvvet"} kind={exercise.type === "cardio" ? "accent" : "primary"} />
        <Badge text={equipTR(d.equipment)} kind="neutral" />
        <Badge text={`MET ${exercise.met}`} kind="neutral" />
      </View>

      {/* Hedef kaslar */}
      {muscles.length > 0 && (
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: c.muted, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>Hedef Kaslar</Text>
          <View style={[s.row, { gap: 7, flexWrap: "wrap" }]}>
            {muscles.map((m, i) => (
              <View key={m + i} style={{ backgroundColor: i === 0 ? c.primarySoft : c.surface2, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: i === 0 ? c.primary : c.muted, fontSize: 12.5, fontWeight: "700" }}>{muscleTR(m)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* İstatistikler (kuvvet + kayıt varsa) */}
      {exercise.type === "strength" && stats.sets > 0 && (
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: c.muted, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>İstatistiklerin</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {stats.best && (
              <StatBox c={c} label="Kişisel rekor" value={`${fmt(stats.best.weight, 1)} kg × ${stats.best.reps}`} sub={formatKey(stats.best.date)} />
            )}
            {stats.orm > 0 && <StatBox c={c} label="Tahmini 1RM" value={`${fmt(stats.orm)} kg`} sub="Epley" />}
            <StatBox c={c} label="Toplam hacim" value={`${fmt(stats.volume)} kg`} sub={`${stats.sets} set`} />
          </View>
        </View>
      )}

      {/* Nasıl yapılır */}
      {d.steps && d.steps.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: c.muted, fontSize: 13, fontWeight: "700", marginBottom: 10 }}>Nasıl Yapılır</Text>
          {d.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <View style={{ width: 24, height: 24, borderRadius: 999, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: c.onPrimary, fontSize: 12, fontWeight: "800" }}>{i + 1}</Text>
              </View>
              <Text style={{ color: c.text, fontSize: 14, flex: 1, lineHeight: 20 }}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </Sheet>
  );
}

function StatBox({ c, label, value, sub }) {
  return (
    <View style={{ width: "47%", flexGrow: 1, backgroundColor: c.surface2, borderRadius: radius.md, padding: 12 }}>
      <Text style={{ color: c.muted, fontSize: 11, fontWeight: "600" }}>{label}</Text>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: "800", marginTop: 2, ...tnum }}>{value}</Text>
      {sub ? <Text style={{ color: c.faint, fontSize: 10.5, marginTop: 1, ...tnum }}>{sub}</Text> : null}
    </View>
  );
}
