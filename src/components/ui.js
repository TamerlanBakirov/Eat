/* Ortak UI bileşenleri — profesyonel tasarım sistemi üzerine kurulu.
   Kart, istatistik, buton (bası ölçek geri bildirimi), rozet, ilerleme, modal. */
import React from "react";
import {
  View, Text, Pressable, TextInput, Modal, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, Image,
} from "react-native";
import { useData } from "../lib/store";
import { palettes, radius, type, tnum, elevation, ACCENTS } from "../theme";
import { Icon } from "./icons";

/* Egzersiz görsel küçük resmi — yüklenemezse kas grubu ikonuna düşer */
export function ExerciseThumb({ img, size = 46, rounded = 12, style }) {
  const c = useTheme();
  const [err, setErr] = React.useState(false);
  const box = { width: size, height: size, borderRadius: rounded, backgroundColor: c.surface2, overflow: "hidden", alignItems: "center", justifyContent: "center" };
  if (!img || err) {
    return (
      <View style={[box, style]}>
        <Icon name="workout" size={size * 0.5} color={c.faint} strokeWidth={2} />
      </View>
    );
  }
  return (
    <View style={[box, style]}>
      <Image
        source={{ uri: img }}
        onError={() => setErr(true)}
        resizeMode="cover"
        style={{ width: "100%", height: "100%", backgroundColor: "#fff" }}
      />
    </View>
  );
}

export function useTheme() {
  const { state } = useData();
  const themeName = state.settings.theme;
  const base = palettes[themeName] || palettes.dark;
  const acc = ACCENTS[state.settings.accent]?.[themeName === "light" ? "light" : "dark"];
  return acc ? { ...base, ...acc } : base;
}

export function Card({ children, style, level = 1, flat }) {
  const c = useTheme();
  return (
    <View style={[{
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 14,
    }, !flat && elevation(c, level), style]}>
      {children}
    </View>
  );
}

export function CardTitle({ children, right, icon }) {
  const c = useTheme();
  return (
    <View style={[s.rowBetween, { marginBottom: 12 }]}>
      <View style={[s.row, { gap: 8, flexShrink: 1 }]}>
        {icon ? <Icon name={icon} size={17} color={c.muted} strokeWidth={2.1} /> : null}
        <Text style={{ color: c.text, ...type.heading }} numberOfLines={1}>
          {children}
        </Text>
      </View>
      {right}
    </View>
  );
}

export function StatTile({ label, value, sub, color, icon, tint }) {
  const c = useTheme();
  const accent = color || c.text;
  return (
    <View style={[{
      flex: 1,
      backgroundColor: c.surface,
      borderColor: c.border,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: radius.md,
      padding: 14,
    }, elevation(c, 1)]}>
      <View style={[s.rowBetween, { marginBottom: 8 }]}>
        <Text style={{ color: c.muted, ...type.caption, textTransform: "uppercase" }} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <View style={{
            width: 26, height: 26, borderRadius: 8,
            backgroundColor: tint || c.surface2,
            alignItems: "center", justifyContent: "center",
          }}>
            <Icon name={icon} size={15} color={accent} strokeWidth={2.2} />
          </View>
        ) : null}
      </View>
      <Text style={{ color: accent, fontSize: 23, fontWeight: "800", letterSpacing: -0.5, ...tnum }}>
        {value}
      </Text>
      {sub ? <Text style={{ color: c.muted, fontSize: 12, marginTop: 2, fontWeight: "500" }}>{sub}</Text> : null}
    </View>
  );
}

export function Btn({ title, onPress, kind = "primary", small, style, icon, disabled }) {
  const c = useTheme();
  const bg = {
    primary: c.primary,
    accent: c.accent,
    success: c.success,
    ghost: c.surface2,
    outline: "transparent",
    danger: c.dangerSoft,
  }[kind];
  const fg = {
    primary: c.onPrimary,
    accent: c.onAccent,
    success: "#fff",
    ghost: c.text,
    outline: c.text,
    danger: c.danger,
  }[kind];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [{
        backgroundColor: bg,
        borderRadius: radius.sm,
        borderWidth: kind === "outline" ? StyleSheet.hairlineWidth : 0,
        borderColor: c.borderStrong,
        paddingVertical: small ? 8 : 12,
        paddingHorizontal: small ? 13 : 18,
        opacity: disabled ? 0.45 : 1,
        transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        justifyContent: "center",
      }, style]}
    >
      {icon ? <Icon name={icon} size={small ? 15 : 17} color={fg} strokeWidth={2.4} /> : null}
      <Text style={{ color: fg, fontWeight: "700", fontSize: small ? 13 : 15, letterSpacing: -0.2 }}>{title}</Text>
    </Pressable>
  );
}

/* İkon butonu — vektör ikon + genişletilmiş dokunma alanı (44pt) */
export function IconBtn({ name, label, onPress, color, size = 20, soft }) {
  const c = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        opacity: pressed ? 0.55 : 1,
        transform: [{ scale: pressed ? 0.92 : 1 }],
        backgroundColor: soft ? c.surface2 : "transparent",
        borderRadius: radius.sm,
        padding: soft ? 8 : 4,
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      {name
        ? <Icon name={name} size={size} color={color || c.muted} strokeWidth={2.2} />
        : <Text style={{ color: color || c.muted, fontSize: 15 }}>{label}</Text>}
    </Pressable>
  );
}

export function ProgressBar({ ratio, color, height = 8 }) {
  const c = useTheme();
  const over = ratio > 1;
  return (
    <View style={{ height, borderRadius: radius.xs, backgroundColor: c.trackHi, overflow: "hidden" }}>
      <View style={{
        width: `${Math.min(Math.max(ratio, 0) * 100, 100)}%`,
        height: "100%",
        borderRadius: radius.xs,
        backgroundColor: over ? c.danger : color || c.primary,
      }} />
    </View>
  );
}

export function Badge({ text, kind = "primary" }) {
  const c = useTheme();
  const map = {
    primary: [c.primarySoft, c.primary],
    accent: [c.accentSoft, c.accent],
    success: [c.successSoft, c.success],
    warning: [c.warningSoft, c.warning],
    danger: [c.dangerSoft, c.danger],
    neutral: [c.surface2, c.muted],
  };
  const [bg, fg] = map[kind] || map.primary;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" }}>
      <Text style={{ color: fg, fontSize: 11, fontWeight: "700", letterSpacing: 0.1 }}>{text}</Text>
    </View>
  );
}

export function EmptyNote({ children }) {
  const c = useTheme();
  return (
    <Text style={{ color: c.muted, fontSize: 13, textAlign: "center", paddingVertical: 16, lineHeight: 19 }}>
      {children}
    </Text>
  );
}

export function Label({ children, required }) {
  const c = useTheme();
  return (
    <Text style={{ color: c.muted, fontSize: 12.5, fontWeight: "600", marginBottom: 6 }}>
      {children}{required ? <Text style={{ color: c.danger }}> *</Text> : null}
    </Text>
  );
}

export function Input(props) {
  const c = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <TextInput
      placeholderTextColor={c.faint}
      {...props}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      style={[{
        borderColor: focused ? c.primary : c.border,
        borderWidth: focused ? 1.5 : StyleSheet.hairlineWidth,
        borderRadius: radius.sm,
        backgroundColor: c.surface2,
        color: c.text,
        paddingVertical: 11,
        paddingHorizontal: 13,
        fontSize: 15,
        fontWeight: "500",
        minWidth: 0,
      }, props.style]}
    />
  );
}

/* Segment kontrolü — dokunmatik seçim çipleri */
export function OptionGroup({ options, value, onChange }) {
  const c = useTheme();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => ({
              backgroundColor: active ? c.primary : c.surface2,
              borderColor: active ? c.primary : c.border,
              borderWidth: StyleSheet.hairlineWidth,
              borderRadius: radius.pill,
              paddingVertical: 8,
              paddingHorizontal: 14,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: active ? c.onPrimary : c.muted, fontSize: 13, fontWeight: "600" }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* Alttan açılan modal sayfa — tutamaç + güçlü scrim + vektör kapat */
export function Sheet({ visible, title, onClose, children }) {
  const c = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: c.scrim, justifyContent: "flex-end" }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Kapat" />
        <View style={[{
          backgroundColor: c.bg,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          maxHeight: "88%",
          paddingBottom: 28,
        }, elevation(c, 3)]}>
          <View style={{ alignItems: "center", paddingTop: 10 }}>
            <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: c.borderStrong }} />
          </View>
          <View style={[s.rowBetween, { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 }]}>
            <Text style={{ color: c.text, ...type.title }}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Kapat" style={{
              backgroundColor: c.surface2, borderRadius: radius.pill, width: 32, height: 32,
              alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="close" size={17} color={c.muted} strokeWidth={2.3} />
            </Pressable>
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
            <View style={{ height: 14 }} />
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
