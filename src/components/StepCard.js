/* Adım sayar — expo-sensors Pedometer. Günlük adım + tahmini kalori. Desteklenmezse gizli. */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Platform } from "react-native";
import { Pedometer } from "expo-sensors";
import { useData } from "../lib/store";
import { fmt } from "../lib/utils";
import { Card, CardTitle, ProgressBar, useTheme, s } from "./ui";
import { Icon } from "./icons";
import { tnum } from "../theme";

const GOAL = 10000;

export default function StepCard() {
  const c = useTheme();
  const { state } = useData();
  const [available, setAvailable] = useState(null);
  const [steps, setSteps] = useState(0);
  const sub = useRef(null);

  useEffect(() => {
    let mounted = true;
    if (Platform.OS === "web") { setAvailable(false); return; }
    (async () => {
      try {
        const ok = await Pedometer.isAvailableAsync();
        if (!mounted) return;
        setAvailable(ok);
        if (!ok) return;
        try {
          const perm = await Pedometer.requestPermissionsAsync?.();
          if (perm && perm.granted === false) { setAvailable(false); return; }
        } catch {}
        // Günün başından şimdiye kadar (iOS geçmiş destekler)
        const start = new Date(); start.setHours(0, 0, 0, 0);
        try {
          const res = await Pedometer.getStepCountAsync(start, new Date());
          if (mounted && res) setSteps(res.steps);
        } catch {}
        // Canlı artış (Android)
        sub.current = Pedometer.watchStepCount((r) => { if (mounted) setSteps((v) => Math.max(v, v + r.steps)); });
      } catch {
        if (mounted) setAvailable(false);
      }
    })();
    return () => { mounted = false; try { sub.current && sub.current.remove(); } catch {} };
  }, []);

  if (available === false || available === null) return null;

  const kcal = Math.round(steps * 0.04 * ((state.profile.weight || 70) / 70));
  const km = (steps * 0.762) / 1000; // ~0.762 m/adım

  return (
    <Card>
      <CardTitle icon="progress" right={<Text style={{ color: c.muted, fontSize: 13, fontWeight: "600", ...tnum }}>{fmt(steps)} / {fmt(GOAL)}</Text>}>
        Adımlar
      </CardTitle>
      <ProgressBar ratio={steps / GOAL} color={c.primary} height={10} />
      <View style={[s.row, { gap: 18, marginTop: 12 }]}>
        <Metric c={c} icon="flame" label="Kalori" value={`${fmt(kcal)}`} />
        <Metric c={c} icon="target" label="Mesafe" value={`${fmt(km, 1)} km`} />
      </View>
    </Card>
  );
}

function Metric({ c, icon, label, value }) {
  return (
    <View style={[s.row, { gap: 8 }]}>
      <Icon name={icon} size={16} color={c.primary} strokeWidth={2.2} />
      <Text style={{ color: c.text, fontSize: 14, fontWeight: "700", ...tnum }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 12 }}>{label}</Text>
    </View>
  );
}
