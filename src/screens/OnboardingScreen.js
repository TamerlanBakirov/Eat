/* İlk açılış sihirbazı — profil sorularını sorar, kural tabanlı program üretir. */
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "../lib/store";
import { parseNum, macroTargets, tdee, fmt } from "../lib/utils";
import { generateProgram } from "../lib/program";
import { useTheme, Btn, Input } from "../components/ui";
import { Segmented } from "../components/ios";
import { Icon } from "../components/icons";
import { radius, tnum } from "../theme";

const ACTIVITY = [
  { value: "sedentary", label: "Hareketsiz", desc: "Masa başı, az hareket" },
  { value: "light", label: "Az aktif", desc: "Haftada 1-3 gün egzersiz" },
  { value: "moderate", label: "Orta aktif", desc: "Haftada 3-5 gün egzersiz" },
  { value: "active", label: "Aktif", desc: "Haftada 6-7 gün egzersiz" },
  { value: "very_active", label: "Çok aktif", desc: "Ağır iş + günlük antrenman" },
];

const GOALS = [
  { value: "lose", label: "Kilo Ver", icon: "progress", desc: "Yağ yak, kalori açığı" },
  { value: "maintain", label: "Formu Koru", icon: "target", desc: "Dengeyi sürdür" },
  { value: "gain", label: "Kas Yap", icon: "workout", desc: "Kas kütlesi kazan" },
];

export default function OnboardingScreen() {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  const { dispatch } = useData();
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");

  const profile = {
    name: name.trim(), gender,
    age: parseNum(age) || 25,
    height: parseNum(height) || 175,
    weight: parseNum(weight) || 75,
    activityLevel: activity, goal,
  };

  const STEPS = ["welcome", "name", "gender", "age", "height", "weight", "activity", "goal", "review"];
  const key = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const valid = {
    welcome: true, name: true, gender: true,
    age: parseNum(age) >= 10 && parseNum(age) <= 100,
    height: parseNum(height) >= 120 && parseNum(height) <= 230,
    weight: parseNum(weight) >= 30 && parseNum(weight) <= 300,
    activity: true, goal: true, review: true,
  }[key];

  function next() {
    if (!valid) return;
    if (isLast) {
      dispatch({ type: "COMPLETE_ONBOARDING", profile, program: generateProgram(profile) });
      return;
    }
    setStep((s) => s + 1);
  }

  const targets = macroTargets(profile);
  const program = key === "review" ? generateProgram(profile) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: c.bg }}
    >
      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16, paddingHorizontal: 22 }}>
        {/* İlerleme çubuğu */}
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 999, backgroundColor: i <= step ? c.primary : c.surface2 }} />
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {key === "welcome" && (
            <Center>
              <View style={{ width: 92, height: 92, borderRadius: 26, backgroundColor: c.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Icon name="flame" size={46} color={c.primary} strokeWidth={2.2} />
              </View>
              <Big c={c}>FitLife'a Hoş Geldin</Big>
              <Sub c={c}>Birkaç soruyla sana özel bir antrenman ve beslenme programı hazırlayalım. Sadece 1 dakika sürer.</Sub>
            </Center>
          )}

          {key === "name" && (
            <Field c={c} title="Adın nedir?" hint="Sana nasıl hitap edelim?">
              <Input value={name} onChangeText={setName} placeholder="Adın" autoFocus style={{ fontSize: 18 }} />
            </Field>
          )}

          {key === "gender" && (
            <Field c={c} title="Cinsiyetin?" hint="Kalori hesabı için kullanılır.">
              <Segmented
                options={[{ value: "male", label: "Erkek" }, { value: "female", label: "Kadın" }]}
                value={gender}
                onChange={setGender}
              />
            </Field>
          )}

          {key === "age" && (
            <Field c={c} title="Kaç yaşındasın?" hint="Yıl olarak gir." unit="yaş">
              <Input value={age} onChangeText={setAge} keyboardType="numeric" placeholder="25" autoFocus style={{ fontSize: 28, fontWeight: "800", textAlign: "center" }} />
            </Field>
          )}

          {key === "height" && (
            <Field c={c} title="Boyun kaç cm?" hint="Santimetre olarak gir." unit="cm">
              <Input value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="175" autoFocus style={{ fontSize: 28, fontWeight: "800", textAlign: "center" }} />
            </Field>
          )}

          {key === "weight" && (
            <Field c={c} title="Kilon kaç kg?" hint="Kilogram olarak gir." unit="kg">
              <Input value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="75" autoFocus style={{ fontSize: 28, fontWeight: "800", textAlign: "center" }} />
            </Field>
          )}

          {key === "activity" && (
            <Field c={c} title="Ne kadar aktifsin?" hint="Haftalık hareket düzeyin.">
              <View style={{ gap: 9 }}>
                {ACTIVITY.map((a) => {
                  const on = activity === a.value;
                  return (
                    <Pressable key={a.value} onPress={() => setActivity(a.value)}
                      style={{
                        padding: 15, borderRadius: radius.md,
                        borderWidth: on ? 2 : StyleSheet.hairlineWidth,
                        borderColor: on ? c.primary : c.border,
                        backgroundColor: on ? c.primarySoft : c.surface,
                      }}>
                      <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>{a.label}</Text>
                      <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{a.desc}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          )}

          {key === "goal" && (
            <Field c={c} title="Hedefin ne?" hint="Program buna göre kurulur.">
              <View style={{ gap: 10 }}>
                {GOALS.map((g) => {
                  const on = goal === g.value;
                  return (
                    <Pressable key={g.value} onPress={() => setGoal(g.value)}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 14,
                        padding: 15, borderRadius: radius.md,
                        borderWidth: on ? 2 : StyleSheet.hairlineWidth,
                        borderColor: on ? c.primary : c.border,
                        backgroundColor: on ? c.primarySoft : c.surface,
                      }}>
                      <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: on ? c.primary : c.surface2, alignItems: "center", justifyContent: "center" }}>
                        <Icon name={g.icon} size={22} color={on ? "#fff" : c.muted} strokeWidth={2.3} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontSize: 16, fontWeight: "700" }}>{g.label}</Text>
                        <Text style={{ color: c.muted, fontSize: 13, marginTop: 2 }}>{g.desc}</Text>
                      </View>
                      {on ? <Icon name="check" size={22} color={c.primary} strokeWidth={2.6} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Field>
          )}

          {key === "review" && program && (
            <Field c={c} title="Programın hazır!" hint={`${name.trim() || "Merhaba"}, sana özel plan oluşturuldu.`}>
              <View style={{ gap: 10 }}>
                <Stat c={c} icon="flame" tint={c.accent} bg={c.accentSoft} label="Günlük kalori hedefi" value={`${fmt(targets.kcal)} kcal`} />
                <Stat c={c} icon="workout" tint={c.primary} bg={c.primarySoft} label="Haftalık antrenman" value={`${program.daysPerWeek} gün`} />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <MiniStat c={c} label="Protein" value={`${targets.protein} g`} />
                  <MiniStat c={c} label="Karb" value={`${targets.carb} g`} />
                  <MiniStat c={c} label="Yağ" value={`${targets.fat} g`} />
                </View>
                <Text style={{ color: c.muted, fontSize: 12.5, marginTop: 4, lineHeight: 18 }}>
                  Program ve hedefler Profil sekmesinden istediğin an güncellenebilir.
                </Text>
              </View>
            </Field>
          )}
        </View>

        {/* Alt gezinme */}
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
          {step > 0 && (
            <Pressable onPress={() => setStep((s) => s - 1)} hitSlop={10}
              style={{ width: 52, height: 52, borderRadius: radius.md, backgroundColor: c.surface2, alignItems: "center", justifyContent: "center" }}>
              <Icon name="chevronLeft" size={22} color={c.text} strokeWidth={2.4} />
            </Pressable>
          )}
          <Btn
            title={key === "welcome" ? "Başlayalım" : isLast ? "Programı Oluştur" : "Devam"}
            onPress={next}
            disabled={!valid}
            style={{ flex: 1, paddingVertical: 16 }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Center({ children }) {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
function Big({ c, children }) {
  return <Text style={{ color: c.text, fontSize: 30, fontWeight: "800", letterSpacing: 0.3, textAlign: "center", marginBottom: 12 }}>{children}</Text>;
}
function Sub({ c, children }) {
  return <Text style={{ color: c.muted, fontSize: 15.5, textAlign: "center", lineHeight: 22, paddingHorizontal: 10 }}>{children}</Text>;
}
function Field({ c, title, hint, unit, children }) {
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Text style={{ color: c.text, fontSize: 27, fontWeight: "800", letterSpacing: 0.2, marginBottom: 6 }}>{title}</Text>
      {hint ? <Text style={{ color: c.muted, fontSize: 15, marginBottom: 26, lineHeight: 21 }}>{hint}</Text> : null}
      {children}
      {unit ? <Text style={{ color: c.faint, fontSize: 13, textAlign: "center", marginTop: 10, fontWeight: "600" }}>{unit}</Text> : null}
    </View>
  );
}
function Stat({ c, icon, tint, bg, label, value }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: c.surface, borderRadius: radius.md, padding: 15 }}>
      <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={22} color={tint} strokeWidth={2.3} />
      </View>
      <Text style={{ color: c.muted, fontSize: 14, flex: 1, fontWeight: "500" }}>{label}</Text>
      <Text style={{ color: c.text, fontSize: 17, fontWeight: "800", ...tnum }}>{value}</Text>
    </View>
  );
}
function MiniStat({ c, label, value }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.md, padding: 13, alignItems: "center" }}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: "800", ...tnum }}>{value}</Text>
      <Text style={{ color: c.muted, fontSize: 11.5, marginTop: 2, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
