/* Ortak UI bileşenleri: kart, istatistik kutusu, buton, ilerleme çubuğu, modal */
import React from "react";
import {
  View, Text, Pressable, TextInput, Modal, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from "react-native";
import { useData } from "../lib/store";
import { palettes } from "../theme";

export function useTheme() {
  const { state } = useData();
  return palettes[state.settings.theme] || palettes.dark;
}

export function Card({ children, style }) {
  const c = useTheme();
  return (
    <View style={[{
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    }, style]}>
      {children}
    </View>
  );
}

export function CardTitle({ children, right }) {
  const c = useTheme();
  return (
    <View style={s.rowBetween}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
        {children}
      </Text>
      {right}
    </View>
  );
}

export function StatTile({ label, value, sub, color }) {
  const c = useTheme();
  return (
    <View style={{
      flex: 1,
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
    }}>
      <Text style={{ color: c.muted, fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Text>
      <Text style={{ color: color || c.text, fontSize: 22, fontWeight: "800", marginTop: 2 }}>
        {value}
      </Text>
      {sub ? <Text style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  );
}

export function Btn({ title, onPress, kind = "primary", small, style }) {
  const c = useTheme();
  const bg = {
    primary: c.primary,
    success: c.success,
    ghost: c.surface2,
    danger: c.dangerSoft,
  }[kind];
  const fg = { primary: "#fff", success: "#fff", ghost: c.text, danger: c.danger }[kind];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        backgroundColor: bg,
        borderRadius: 9,
        paddingVertical: small ? 6 : 11,
        paddingHorizontal: small ? 12 : 16,
        opacity: pressed ? 0.75 : 1,
        alignItems: "center",
      }, style]}
    >
      <Text style={{ color: fg, fontWeight: "700", fontSize: small ? 12 : 14 }}>{title}</Text>
    </Pressable>
  );
}

export function IconBtn({ label, onPress, color }) {
  const c = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
      <Text style={{ color: color || c.muted, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ ratio, color, height = 9 }) {
  const c = useTheme();
  const over = ratio > 1;
  return (
    <View style={{ height, borderRadius: 6, backgroundColor: c.surface2, overflow: "hidden" }}>
      <View style={{
        width: `${Math.min(ratio * 100, 100)}%`,
        height: "100%",
        borderRadius: 6,
        backgroundColor: over ? c.danger : color || c.primary,
      }} />
    </View>
  );
}

export function Badge({ text, kind = "primary" }) {
  const c = useTheme();
  const map = {
    primary: [c.primarySoft, c.primary],
    success: [c.successSoft, c.success],
    warning: [c.warningSoft, c.warning],
    danger: [c.dangerSoft, c.danger],
  };
  const [bg, fg] = map[kind];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

export function EmptyNote({ children }) {
  const c = useTheme();
  return (
    <Text style={{ color: c.muted, fontSize: 13, textAlign: "center", paddingVertical: 14 }}>
      {children}
    </Text>
  );
}

export function Label({ children }) {
  const c = useTheme();
  return (
    <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600", marginBottom: 5 }}>
      {children}
    </Text>
  );
}

export function Input(props) {
  const c = useTheme();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      {...props}
      style={[{
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 9,
        backgroundColor: c.surface,
        color: c.text,
        paddingVertical: 9,
        paddingHorizontal: 12,
        fontSize: 15,
      }, props.style]}
    />
  );
}

/* Seçenek grubu — select yerine dokunmatik butonlar */
export function OptionGroup({ options, value, onChange }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              backgroundColor: active ? c.primary : c.surface,
              borderColor: active ? c.primary : c.border,
              borderWidth: 1,
              borderRadius: 999,
              paddingVertical: 7,
              paddingHorizontal: 13,
            }}
          >
            <Text style={{ color: active ? "#fff" : c.muted, fontSize: 13, fontWeight: "600" }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* Alttan açılan modal sayfa */
export function Sheet({ visible, title, onClose, children }) {
  const c = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "rgba(5,10,25,0.6)", justifyContent: "flex-end" }}
      >
        <View style={{
          backgroundColor: c.bg,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "88%",
          paddingBottom: 24,
        }}>
          <View style={[s.rowBetween, { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8 }]}>
            <Text style={{ color: c.text, fontSize: 17, fontWeight: "800" }}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={{
              backgroundColor: c.surface2, borderRadius: 999, width: 30, height: 30,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ color: c.muted, fontSize: 13 }}>✕</Text>
            </Pressable>
          </View>
          <ScrollView style={{ paddingHorizontal: 18 }} keyboardShouldPersistTaps="handled">
            {children}
            <View style={{ height: 12 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const s = StyleSheet.create({
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center" },
  gap: { gap: 10 },
});
