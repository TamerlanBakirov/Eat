/* Barkod tarama — kamera ile okut → OpenFoodFacts → öğüne ekle. Web/izin yoksa elle kod girişi. */
import React, { useState } from "react";
import { Modal, View, Text, Pressable, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useData } from "../lib/store";
import { lookupBarcode } from "../lib/off";
import { currentMealKey, MEAL_NAMES, fmt, round, parseNum, timeStamp } from "../lib/utils";
import { useTheme, Btn, Input, Label, Badge, s } from "./ui";
import { Segmented } from "./ios";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";

export default function BarcodeScannerSheet({ dateKey, onClose }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { dispatch } = useData();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [grams, setGrams] = useState("100");
  const [meal, setMeal] = useState(currentMealKey());
  const [manual, setManual] = useState("");

  async function handleCode(code) {
    if (loading) return;
    setScanned(true); setLoading(true); setError(null); setResult(null);
    try {
      const r = await lookupBarcode(code);
      setResult(r);
      setGrams(String(r.serving || 100));
    } catch (e) {
      setError(e.message || "Bulunamadı.");
    } finally {
      setLoading(false);
    }
  }

  function addToLog() {
    if (!result) return;
    const g = parseNum(grams) || 100;
    const k = g / 100;
    dispatch({
      type: "ADD_FOOD", dateKey, meal,
      entry: {
        name: result.brand ? `${result.name} (${result.brand})` : result.name,
        grams: g,
        kcal: round(result.per100.kcal * k),
        p: round(result.per100.p * k, 1),
        c: round(result.per100.c * k, 1),
        f: round(result.per100.f * k, 1),
        time: timeStamp(), source: "barcode",
      },
    });
    onClose();
  }

  const canScan = permission?.granted && Platform.OS !== "web";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
        {/* Üst bar */}
        <View style={[s.rowBetween, { paddingHorizontal: 16, paddingVertical: 12 }]}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Barkod Tara</Text>
          <Pressable onPress={onClose} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
            <Icon name="close" size={18} color="#fff" strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Kamera veya izin/elle giriş */}
        {!result && (
          <View style={{ flex: 1 }}>
            {canScan ? (
              <View style={{ flex: 1, overflow: "hidden" }}>
                <CameraView
                  style={{ flex: 1 }}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128"] }}
                  onBarcodeScanned={scanned ? undefined : ({ data }) => handleCode(data)}
                />
                <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }} pointerEvents="none">
                  <View style={{ width: "72%", height: 140, borderWidth: 2, borderColor: "rgba(255,255,255,0.85)", borderRadius: 16 }} />
                  <Text style={{ color: "#fff", marginTop: 16, fontSize: 13, opacity: 0.9 }}>Barkodu çerçeveye hizala</Text>
                </View>
                {scanned && !loading && (
                  <View style={{ position: "absolute", bottom: insets.bottom + 20, left: 20, right: 20 }}>
                    <Btn title="Tekrar tara" onPress={() => { setScanned(false); setError(null); }} />
                  </View>
                )}
              </View>
            ) : (
              <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
                <View style={{ backgroundColor: c.surface, borderRadius: radius.lg, padding: 20 }}>
                  <Icon name="nutrition" size={38} color={c.primary} strokeWidth={2} />
                  <Text style={{ color: c.text, fontSize: 17, fontWeight: "800", marginTop: 12 }}>
                    {Platform.OS === "web" ? "Web'de barkod kamerası sınırlı" : "Kamera izni gerekli"}
                  </Text>
                  <Text style={{ color: c.muted, fontSize: 13, marginTop: 6, lineHeight: 19 }}>
                    {Platform.OS === "web"
                      ? "Barkod numarasını elle girip arayabilirsin. Kamera taraması telefonda (Expo Go) çalışır."
                      : "Kameradan tarama için izin ver, ya da barkod numarasını elle gir."}
                  </Text>
                  {Platform.OS !== "web" && !permission?.granted && (
                    <View style={{ marginTop: 14 }}>
                      <Btn title="Kamera İzni Ver" icon="check" onPress={requestPermission} />
                    </View>
                  )}
                  <View style={{ height: 16 }} />
                  <Label>Barkod numarası</Label>
                  <Input value={manual} onChangeText={setManual} keyboardType="numeric" placeholder="örn. 8690000000000" />
                  <View style={{ height: 10 }} />
                  <Btn title="Ara" icon="chevronRight" onPress={() => manual.trim() && handleCode(manual.trim())} />
                </View>
              </View>
            )}

            {loading && (
              <View style={{ position: "absolute", bottom: insets.bottom + 30, left: 0, right: 0, alignItems: "center" }}>
                <View style={{ flexDirection: "row", gap: 10, backgroundColor: c.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 999 }}>
                  <ActivityIndicator color={c.primary} />
                  <Text style={{ color: c.text, fontSize: 13 }}>Ürün aranıyor…</Text>
                </View>
              </View>
            )}
            {error && !loading && (
              <View style={{ position: "absolute", bottom: insets.bottom + 30, left: 20, right: 20 }}>
                <View style={{ backgroundColor: c.dangerSoft, borderRadius: radius.md, padding: 12 }}>
                  <Text style={{ color: c.danger, fontSize: 13, textAlign: "center", fontWeight: "600" }}>{error}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Sonuç */}
        {result && (
          <View style={{ flex: 1, backgroundColor: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, marginTop: 8 }}>
            <View style={[s.rowBetween, { marginBottom: 2 }]}>
              <Text style={{ color: c.text, fontSize: 20, fontWeight: "800", flex: 1 }}>{result.name}</Text>
              <Badge text="Barkod" kind="primary" />
            </View>
            {result.brand ? <Text style={{ color: c.muted, fontSize: 13, marginBottom: 8 }}>{result.brand}</Text> : null}
            <Text style={{ color: c.accent, fontSize: 26, fontWeight: "800", ...tnum, marginBottom: 4 }}>{fmt(result.per100.kcal)} kcal</Text>
            <Text style={{ color: c.muted, fontSize: 12.5, marginBottom: 16 }}>100 g başına · P {fmt(result.per100.p, 1)} · K {fmt(result.per100.c, 1)} · Y {fmt(result.per100.f, 1)}</Text>

            <Label>Miktar (gram)</Label>
            <Input value={grams} onChangeText={setGrams} keyboardType="numeric" />
            <View style={{ height: 14 }} />
            <Label>Öğün (saate göre otomatik)</Label>
            <Segmented options={["kahvalti", "ogle", "aksam", "ara"].map((k) => ({ value: k, label: MEAL_NAMES[k].split(" ")[0] }))} value={meal} onChange={setMeal} />
            <View style={{ height: 18 }} />
            <Btn title="Öğüne Ekle" icon="check" kind="success" onPress={addToLog} />
            <View style={{ height: 10 }} />
            <Btn title="Yeni Tara" kind="ghost" onPress={() => { setResult(null); setScanned(false); setError(null); }} />
          </View>
        )}
      </View>
    </Modal>
  );
}
