/* Ekran başlığı + gün gezinme çubuğu */
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useDate } from "../lib/store";
import { useTheme, s } from "./ui";
import { shiftKey, todayKey, formatKey } from "../lib/utils";

export default function DateHeader({ title, showDate = true }) {
  const c = useTheme();
  const { dateKey, setDateKey } = useDate();
  const isToday = dateKey === todayKey();

  const navBtn = (label, onPress) => (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => ({
        backgroundColor: c.surface,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 11,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ color: c.text, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={s.rowBetween}>
        <Text style={{ color: c.text, fontSize: 24, fontWeight: "800" }}>{title}</Text>
        {showDate && (
          <View style={[s.row, { gap: 6 }]}>
            {navBtn("‹", () => setDateKey(shiftKey(dateKey, -1)))}
            {navBtn("›", () => setDateKey(shiftKey(dateKey, 1)))}
            {!isToday && navBtn("Bugün", () => setDateKey(todayKey()))}
          </View>
        )}
      </View>
      {showDate && (
        <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>
          {formatKey(dateKey)}{isToday ? " · Bugün" : ""}
        </Text>
      )}
    </View>
  );
}
