/* Paylaşılabilir başarı kartı — görsel olarak yakala + paylaş (react-native-view-shot). */
import React, { useRef, useState } from "react";
import { View, Text, Share, Platform, Alert } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useData } from "../lib/store";
import { fmt } from "../lib/utils";
import { currentStreak, totalWorkouts, computeBadges, weeklyReport } from "../lib/achievements";
import { Card, CardTitle, Btn, useTheme, s } from "./ui";
import { Icon } from "./icons";
import { radius, tnum } from "../theme";

export default function ShareCard({ dateKey }) {
  const c = useTheme();
  const { state } = useData();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const streak = currentStreak(state);
  const workouts = totalWorkouts(state);
  const earned = computeBadges(state).filter((b) => b.earned).length;
  const report = weeklyReport(state, dateKey);
  const name = state.profile.name || "Sporcu";

  async function share() {
    setBusy(true);
    try {
      const uri = await captureRef(ref, { format: "png", quality: 0.95 });
      await Share.share(Platform.OS === "ios" ? { url: uri } : { message: "FitLife ilerlemem 💪", url: uri });
    } catch (e) {
      try { await Share.share({ message: `FitLife: ${streak} gün seri, ${workouts} antrenman, ${earned} rozet! 💪` }); }
      catch { Alert.alert("Paylaşılamadı", "Bu platformda paylaşım desteklenmiyor."); }
    } finally { setBusy(false); }
  }

  return (
    <Card>
      <CardTitle icon="star">Başarını Paylaş</CardTitle>

      {/* Yakalanacak kart */}
      <View ref={ref} collapsable={false} style={{ backgroundColor: c.primary, borderRadius: radius.lg, padding: 20, overflow: "hidden" }}>
        <View style={[s.rowBetween, { marginBottom: 16 }]}>
          <View style={[s.row, { gap: 8 }]}>
            <Icon name="flame" size={22} color={c.onPrimary} strokeWidth={2.4} />
            <Text style={{ color: c.onPrimary, fontSize: 18, fontWeight: "800" }}>FitLife</Text>
          </View>
          <Text style={{ color: c.onPrimary, opacity: 0.85, fontSize: 13, fontWeight: "600" }}>{name}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ShareStat c={c} value={`${streak}`} label="gün seri" />
          <ShareStat c={c} value={`${workouts}`} label="antrenman" />
          <ShareStat c={c} value={`${earned}`} label="rozet" />
        </View>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ShareStat c={c} value={`${report.activeDays}/7`} label="bu hafta aktif" />
          <ShareStat c={c} value={fmt(report.burned)} label="hafta yakılan kcal" />
        </View>
      </View>

      <View style={{ height: 14 }} />
      <Btn title="Görsel Olarak Paylaş" icon="progress" disabled={busy} onPress={share} />
    </Card>
  );
}

function ShareStat({ c, value, label }) {
  return (
    <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: radius.md, padding: 13, alignItems: "center" }}>
      <Text style={{ color: c.onPrimary, fontSize: 24, fontWeight: "800", ...tnum }}>{value}</Text>
      <Text style={{ color: c.onPrimary, opacity: 0.9, fontSize: 11, fontWeight: "600", marginTop: 2, textAlign: "center" }}>{label}</Text>
    </View>
  );
}
