/* Ekran başlığı + gün gezinme çubuğu */
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDate } from "../lib/store";
import { useTheme, s } from "./ui";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";
import { shiftKey, todayKey, formatKey } from "../lib/utils";

export default function DateHeader({ title, showDate = true }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { dateKey, setDateKey } = useDate();
  const isToday = dateKey === todayKey();

  const navBtn = (icon, onPress, label) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        backgroundColor: c.surface2,
        borderRadius: radius.sm,
        width: 34,
        height: 34,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Icon name={icon} size={18} color={c.text} strokeWidth={2.4} />
    </Pressable>
  );

  return (
    <View style={{ marginBottom: 16, paddingTop: insets.top + 6 }}>
      <View style={s.rowBetween}>
        <Text style={{ color: c.text, fontSize: 34, fontWeight: "800", letterSpacing: 0.37 }}>{title}</Text>
        {showDate && (
          <View style={[s.row, { gap: 7 }]}>
            {navBtn("chevronLeft", () => setDateKey(shiftKey(dateKey, -1)), "Önceki gün")}
            {navBtn("chevronRight", () => setDateKey(shiftKey(dateKey, 1)), "Sonraki gün")}
          </View>
        )}
      </View>
      {showDate && (
        <View style={[s.row, { gap: 8, marginTop: 4 }]}>
          <Text style={{ color: c.muted, fontSize: 13, fontWeight: "500", ...tnum }}>
            {formatKey(dateKey)}
          </Text>
          {isToday ? (
            <View style={{ backgroundColor: c.primarySoft, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 2 }}>
              <Text style={{ color: c.primary, fontSize: 11, fontWeight: "700" }}>Bugün</Text>
            </View>
          ) : (
            <Pressable onPress={() => setDateKey(todayKey())} hitSlop={6}>
              <Text style={{ color: c.primary, fontSize: 12.5, fontWeight: "700" }}>Bugüne dön</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
