/* İlerleme ekstraları: vücut ölçüleri, ilerleme fotoğrafları, aktivite ısı haritası. */
import React, { useState } from "react";
import { View, Text, Pressable, Image, ScrollView, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useData } from "../lib/store";
import { fmt, todayKey, formatKey, parseNum, keyToDate, dateToKey } from "../lib/utils";
import { savePhoto, deletePhoto } from "../lib/photos";
import { Card, CardTitle, Btn, Label, Input, Sheet, EmptyNote, Badge, useTheme, s } from "./ui";
import { Icon } from "./icons";
import { LineChart } from "./charts";
import { radius, tnum } from "../theme";

/* ---------------- Vücut Ölçüleri ---------------- */
const FIELDS = [
  { key: "waist", label: "Bel", unit: "cm" },
  { key: "chest", label: "Göğüs", unit: "cm" },
  { key: "hip", label: "Kalça", unit: "cm" },
  { key: "arm", label: "Kol", unit: "cm" },
  { key: "thigh", label: "Bacak", unit: "cm" },
];

export function MeasurementsCard() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const [open, setOpen] = useState(false);
  const list = state.measurements || [];
  const latest = list[list.length - 1];
  const first = list[0];

  const waistData = list.slice(-14).map((m) => ({ label: String(keyToDate(m.date).getDate()), value: m.waist ?? null }));
  const hasWaist = waistData.some((d) => d.value != null);

  return (
    <Card>
      <CardTitle icon="scale" right={<Btn title="Ölçü Ekle" icon="plus" small onPress={() => setOpen(true)} />}>
        Vücut Ölçüleri
      </CardTitle>
      {!latest ? (
        <EmptyNote>Henüz ölçü yok. Bel, göğüs, kol gibi ölçülerini ekleyerek ilerlemeni takip et.</EmptyNote>
      ) : (
        <>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: hasWaist ? 12 : 0 }}>
            {FIELDS.map((f) => {
              const v = latest[f.key];
              if (v == null) return null;
              const fv = first ? first[f.key] : null;
              const diff = fv != null && list.length > 1 ? v - fv : null;
              return (
                <View key={f.key} style={{ width: "47%", flexGrow: 1, backgroundColor: c.surface2, borderRadius: radius.md, padding: 12 }}>
                  <Text style={{ color: c.muted, fontSize: 11.5, fontWeight: "600" }}>{f.label}</Text>
                  <View style={[s.row, { gap: 6, marginTop: 2 }]}>
                    <Text style={{ color: c.text, fontSize: 18, fontWeight: "800", ...tnum }}>{fmt(v, 1)}<Text style={{ fontSize: 12, color: c.muted }}> cm</Text></Text>
                    {diff != null && diff !== 0 && (
                      <Text style={{ color: diff < 0 ? c.success : c.warning, fontSize: 11.5, fontWeight: "700", ...tnum }}>
                        {diff > 0 ? "+" : ""}{fmt(diff, 1)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          {hasWaist && (
            <>
              <Text style={{ color: c.muted, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>Bel (cm) — son ölçümler</Text>
              <LineChart data={waistData} color={c.primary} unit="cm" />
            </>
          )}
        </>
      )}
      <MeasurementSheet visible={open} onClose={() => setOpen(false)} initial={latest} />
    </Card>
  );
}

function MeasurementSheet({ visible, onClose, initial }) {
  const c = useTheme();
  const { dispatch } = useData();
  const [vals, setVals] = useState({});

  function save() {
    const values = {};
    let any = false;
    FIELDS.forEach((f) => {
      const raw = vals[f.key];
      if (raw != null && String(raw).trim() !== "") { values[f.key] = parseNum(raw); any = true; }
      else if (initial && initial[f.key] != null) { values[f.key] = initial[f.key]; }
    });
    if (!any) { onClose(); return; }
    dispatch({ type: "ADD_MEASUREMENT", date: todayKey(), values });
    setVals({});
    onClose();
  }

  return (
    <Sheet visible={visible} title="Ölçü Ekle" onClose={onClose}>
      <Text style={{ color: c.muted, fontSize: 13, marginBottom: 14 }}>Bugün ({formatKey(todayKey())}) için ölçülerini gir. Boş bıraktıkların önceki değerini korur.</Text>
      <View style={{ gap: 12 }}>
        {FIELDS.map((f) => (
          <View key={f.key}>
            <Label>{f.label} ({f.unit})</Label>
            <Input
              keyboardType="numeric"
              placeholder={initial && initial[f.key] != null ? String(initial[f.key]) : "—"}
              value={vals[f.key] ?? ""}
              onChangeText={(t) => setVals((v) => ({ ...v, [f.key]: t }))}
            />
          </View>
        ))}
      </View>
      <View style={{ height: 16 }} />
      <Btn title="Kaydet" icon="check" onPress={save} />
    </Sheet>
  );
}

/* ---------------- İlerleme Fotoğrafları ---------------- */
export function ProgressPhotosCard() {
  const c = useTheme();
  const { state, dispatch } = useData();
  const photos = state.photos || [];
  const [viewer, setViewer] = useState(null);
  const [compare, setCompare] = useState(false);
  const [busy, setBusy] = useState(false);

  async function add(fromCamera) {
    setBusy(true);
    try {
      const perm = fromCamera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { Alert.alert("İzin gerekli", "Fotoğraf için izin ver."); return; }
      const opts = { quality: 0.6, mediaTypes: ImagePicker.MediaTypeOptions.Images };
      const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled) return;
      const uri = await savePhoto(res.assets[0].uri);
      dispatch({ type: "ADD_PHOTO", photo: { id: `${Date.now()}`, date: todayKey(), uri } });
    } catch {
      Alert.alert("Hata", "Fotoğraf eklenemedi.");
    } finally { setBusy(false); }
  }

  function remove(p) {
    Alert.alert("Fotoğrafı sil", "Bu ilerleme fotoğrafı silinsin mi?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => { await deletePhoto(p.uri); dispatch({ type: "REMOVE_PHOTO", id: p.id }); setViewer(null); } },
    ]);
  }

  const oldest = photos[photos.length - 1];
  const newest = photos[0];

  return (
    <Card>
      <CardTitle icon="profile" right={photos.length >= 2 ? (
        <Pressable onPress={() => setCompare((v) => !v)}><Text style={{ color: c.primary, fontSize: 13, fontWeight: "700" }}>{compare ? "Galeri" : "Kıyasla"}</Text></Pressable>
      ) : null}>
        İlerleme Fotoğrafları
      </CardTitle>

      {photos.length === 0 ? (
        <EmptyNote>Önce/sonra fotoğrafı ekleyerek görsel ilerlemeni takip et.</EmptyNote>
      ) : compare && photos.length >= 2 ? (
        <View style={{ flexDirection: "row", gap: 10 }}>
          <CompareCol c={c} label="İlk" p={oldest} />
          <CompareCol c={c} label="Son" p={newest} />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {photos.map((p) => (
            <Pressable key={p.id} onPress={() => setViewer(p)}>
              <Image source={{ uri: p.uri }} style={{ width: 110, height: 150, borderRadius: radius.md, backgroundColor: c.surface2 }} />
              <Text style={{ color: c.muted, fontSize: 11, marginTop: 4, textAlign: "center", ...tnum }}>{formatKey(p.date)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
        <Btn title="Çek" icon="plus" style={{ flex: 1 }} disabled={busy} onPress={() => add(true)} />
        <Btn title="Galeriden" icon="plus" kind="ghost" style={{ flex: 1 }} disabled={busy} onPress={() => add(false)} />
      </View>

      {viewer && (
        <Sheet visible title={formatKey(viewer.date)} onClose={() => setViewer(null)}>
          <Image source={{ uri: viewer.uri }} style={{ width: "100%", height: 380, borderRadius: radius.md, backgroundColor: c.surface2 }} resizeMode="contain" />
          <View style={{ height: 14 }} />
          <Btn title="Fotoğrafı Sil" icon="trash" kind="danger" onPress={() => remove(viewer)} />
        </Sheet>
      )}
    </Card>
  );
}

function CompareCol({ c, label, p }) {
  return (
    <View style={{ flex: 1 }}>
      <Badge text={label} kind="neutral" />
      <Image source={{ uri: p.uri }} style={{ width: "100%", height: 220, borderRadius: radius.md, backgroundColor: c.surface2, marginTop: 6 }} resizeMode="cover" />
      <Text style={{ color: c.muted, fontSize: 11, marginTop: 4, textAlign: "center", ...tnum }}>{formatKey(p.date)}</Text>
    </View>
  );
}

/* ---------------- Aktivite Isı Haritası ---------------- */
export function ActivityHeatmap() {
  const c = useTheme();
  const { state } = useData();
  const WEEKS = 15;

  // Bugünün haftasının sonuna (Pazar) hizala, geriye WEEKS hafta
  const today = keyToDate(todayKey());
  const cols = [];
  // en sağdaki sütun bugünü içeren hafta
  const startMonday = new Date(today);
  const dow = (today.getDay() + 6) % 7; // Pazartesi=0
  startMonday.setDate(today.getDate() - dow - (WEEKS - 1) * 7);

  let level = (k) => {
    const d = state.logs[k];
    if (!d) return 0;
    const food = d.meals && Object.values(d.meals).some((m) => m.length > 0);
    const workout = d.workouts && d.workouts.length > 0;
    if (workout && food) return 3;
    if (workout) return 2;
    if (food) return 1;
    return 0;
  };

  const colors = [c.surface2, c.primarySoft, c.primary, c.primary];
  const opacities = [1, 1, 0.65, 1];

  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let dd = 0; dd < 7; dd++) {
      const dt = new Date(startMonday);
      dt.setDate(startMonday.getDate() + w * 7 + dd);
      const k = dateToKey(dt);
      const future = dt > today;
      days.push({ k, lvl: future ? -1 : level(k) });
    }
    cols.push(days);
  }

  return (
    <Card>
      <CardTitle icon="flame">Aktivite Takvimi</CardTitle>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 3 }}>
          {cols.map((week, wi) => (
            <View key={wi} style={{ gap: 3 }}>
              {week.map((d, di) => (
                <View key={di} style={{
                  width: 15, height: 15, borderRadius: 3,
                  backgroundColor: d.lvl < 0 ? "transparent" : colors[d.lvl],
                  opacity: d.lvl < 0 ? 0 : opacities[d.lvl],
                }} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[s.row, { gap: 6, marginTop: 12, justifyContent: "flex-end" }]}>
        <Text style={{ color: c.muted, fontSize: 10.5 }}>Az</Text>
        {[0, 1, 2, 3].map((l) => (
          <View key={l} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: colors[l], opacity: opacities[l] }} />
        ))}
        <Text style={{ color: c.muted, fontSize: 10.5 }}>Çok</Text>
      </View>
    </Card>
  );
}
