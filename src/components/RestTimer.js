/* Dinlenme sayacı — setler arası geri sayım. Alttan çıkan bar. Haptik + otomatik kapanış. */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme, s } from "./ui";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";

function haptic(type) {
  if (Platform.OS === "web") return;
  try {
    if (type === "done") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export default function RestTimer({ seconds = 90, onClose }) {
  const c = useTheme();
  const [left, setLeft] = useState(seconds);
  const [total, setTotal] = useState(seconds);
  const ref = useRef(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(ref.current); haptic("done"); setTimeout(onClose, 400); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, []);

  function bump(d) {
    haptic("tick");
    setLeft((v) => Math.max(1, v + d));
    setTotal((t) => Math.max(1, t + d));
  }

  const mm = String(Math.floor(left / 60)).padStart(1, "0");
  const ssv = String(left % 60).padStart(2, "0");
  const ratio = total > 0 ? left / total : 0;

  return (
    <View style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
      <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: c.border, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
        <View style={[s.rowBetween, { marginBottom: 10 }]}>
          <View style={[s.row, { gap: 8 }]}>
            <Icon name="clock" size={18} color={c.primary} strokeWidth={2.3} />
            <Text style={{ color: c.text, fontSize: 14, fontWeight: "700" }}>Dinlenme</Text>
          </View>
          <Text style={{ color: c.primary, fontSize: 22, fontWeight: "800", ...tnum }}>{mm}:{ssv}</Text>
        </View>
        <View style={{ height: 5, borderRadius: 999, backgroundColor: c.surface2, overflow: "hidden", marginBottom: 12 }}>
          <View style={{ width: `${ratio * 100}%`, height: "100%", backgroundColor: c.primary, borderRadius: 999 }} />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TimerBtn c={c} label="−15" onPress={() => bump(-15)} />
          <TimerBtn c={c} label="+15" onPress={() => bump(15)} />
          <Pressable onPress={onClose} style={({ pressed }) => ({ flex: 1.4, backgroundColor: c.primary, borderRadius: radius.sm, paddingVertical: 11, alignItems: "center", opacity: pressed ? 0.85 : 1 })}>
            <Text style={{ color: c.onPrimary, fontWeight: "800", fontSize: 14 }}>Atla</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function TimerBtn({ c, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flex: 1, backgroundColor: c.surface2, borderRadius: radius.sm, paddingVertical: 11, alignItems: "center", opacity: pressed ? 0.7 : 1 })}>
      <Text style={{ color: c.text, fontWeight: "700", fontSize: 14, ...tnum }}>{label}</Text>
    </Pressable>
  );
}
