/* iOS tarzı bileşenler — gruplu liste, segment kontrol, büyük başlık, switch.
   Apple HIG idiomlarını taklit eder: inset grouped list, SF benzeri tipografi. */
import React from "react";
import { View, Text, Pressable, StyleSheet, Switch, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "./ui";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";

/* Ekran sarmalayıcı — gruplu arka plan + üst güvenli alan + büyük başlık */
export function Screen({ title, subtitle, right, children, scroll = true, headerLarge = true }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const Header = (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: headerLarge ? 6 : 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.text, fontSize: headerLarge ? 34 : 22, fontWeight: "800", letterSpacing: headerLarge ? 0.37 : -0.2 }}>
            {title}
          </Text>
          {subtitle ? <Text style={{ color: c.muted, fontSize: 13, marginTop: 2, fontWeight: "500", ...tnum }}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
  if (!scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
        {Header}
        {children}
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {Header}
        <View style={{ paddingHorizontal: 16 }}>{children}</View>
      </ScrollView>
    </View>
  );
}

/* Bölüm başlığı — iOS gri, küçük, üst boşluklu */
export function Section({ children, style }) {
  const c = useTheme();
  return (
    <Text style={[{
      color: c.muted, fontSize: 13, fontWeight: "600",
      marginTop: 22, marginBottom: 7, marginLeft: 4, letterSpacing: -0.1,
    }, style]}>
      {children}
    </Text>
  );
}

/* Inset gruplu liste kabı */
export function ListGroup({ children, footer }) {
  const c = useTheme();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <>
      <View style={{ backgroundColor: c.surface, borderRadius: radius.md, overflow: "hidden" }}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 ? (
              <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: child.props?.inset ?? 54 }} />
            ) : null}
          </View>
        ))}
      </View>
      {footer ? <Text style={{ color: c.muted, fontSize: 12, marginTop: 7, marginLeft: 4, lineHeight: 16 }}>{footer}</Text> : null}
    </>
  );
}

/* Liste satırı — sol ikon karesi + başlık + sağ değer/chevron/switch */
export function ListRow({ icon, iconBg, title, subtitle, value, onPress, chevron, right, danger, inset }) {
  const c = useTheme();
  const color = danger ? c.danger : c.text;
  const body = (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14, minHeight: 48 }}>
      {icon ? (
        <View style={{ width: 30, height: 30, borderRadius: 7.5, backgroundColor: iconBg || c.primary, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
          <Icon name={icon} size={17} color="#fff" strokeWidth={2.3} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ color, fontSize: 16, fontWeight: "500", letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? <Text style={{ color: c.muted, fontSize: 12.5, marginTop: 1 }}>{subtitle}</Text> : null}
      </View>
      {value != null ? <Text style={{ color: c.muted, fontSize: 15.5, ...tnum, marginRight: chevron ? 6 : 0 }}>{value}</Text> : null}
      {right}
      {chevron ? <Icon name="chevronRight" size={17} color={c.faint} strokeWidth={2.4} /> : null}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ backgroundColor: pressed ? c.surface2 : "transparent" })}>
      {body}
    </Pressable>
  );
}

/* iOS segment kontrolü */
export function Segmented({ options, value, onChange, style }) {
  const c = useTheme();
  return (
    <View style={[{
      flexDirection: "row",
      backgroundColor: c.surface2,
      borderRadius: 9,
      padding: 2,
    }, style]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 7,
              backgroundColor: active ? c.surface : "transparent",
              alignItems: "center",
              justifyContent: "center",
              ...(active ? {
                shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2,
              } : {}),
            }}
          >
            <Text style={{ color: active ? c.text : c.muted, fontSize: 13.5, fontWeight: active ? "700" : "500" }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* iOS switch */
export function IOSSwitch({ value, onValueChange }) {
  const c = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: c.surface3, true: c.primary }}
      thumbColor="#fff"
      ios_backgroundColor={c.surface3}
    />
  );
}
