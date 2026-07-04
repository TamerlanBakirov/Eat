/* FitLife — Beslenme & Antrenman Takibi (Eat + Gym birleşimi) */
import React from "react";
import { View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DataProvider, DateProvider, useData } from "./src/lib/store";
import { palettes, ACCENTS } from "./src/theme";
import { initNotifications } from "./src/lib/notify";
import { Icon } from "./src/components/icons";
import DashboardScreen from "./src/screens/DashboardScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Özet", component: DashboardScreen, icon: "overview" },
  { name: "Beslenme", component: NutritionScreen, icon: "nutrition" },
  { name: "Antrenman", component: WorkoutScreen, icon: "workout" },
  { name: "İlerleme", component: ProgressScreen, icon: "progress" },
  { name: "Profil", component: ProfileScreen, icon: "profile" },
];

/* iOS tarzı buzlu cam tab bar arka planı */
function TabBarBackground({ c, themeName }) {
  return (
    <View style={{ flex: 1, backgroundColor: c.navBg }}>
      <BlurView
        intensity={Platform.OS === "web" ? 24 : 40}
        tint={themeName === "dark" ? "dark" : "light"}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </View>
  );
}

function Root() {
  const { state } = useData();
  const themeName = state.settings.theme;
  const base = palettes[themeName] || palettes.dark;
  const acc = ACCENTS[state.settings.accent]?.[themeName === "light" ? "light" : "dark"];
  const c = acc ? { ...base, ...acc } : base;

  React.useEffect(() => { initNotifications(); }, []);

  const navTheme = {
    ...(themeName === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(themeName === "dark" ? DarkTheme : DefaultTheme).colors,
      background: c.bg,
      card: c.surface,
      border: c.border,
      text: c.text,
      primary: c.primary,
    },
  };

  const onboarded = state.settings.onboarded;

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      {!onboarded ? (
        <OnboardingScreen />
      ) : (
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: c.primary,
            tabBarInactiveTintColor: c.faint,
            tabBarStyle: {
              position: "absolute",
              backgroundColor: "transparent",
              borderTopColor: c.border,
              borderTopWidth: StyleSheetHairline,
              height: 60 + (Platform.OS === "ios" ? 24 : 0),
              paddingTop: 8,
            },
            tabBarBackground: () => <TabBarBackground c={c} themeName={themeName} />,
            tabBarItemStyle: { paddingTop: 2 },
            tabBarLabelStyle: { fontWeight: "600", fontSize: 10, letterSpacing: 0.2, marginTop: 2 },
          }}
        >
          {TABS.map((tab) => (
            <Tab.Screen
              key={tab.name}
              name={tab.name}
              component={tab.component}
              options={{
                tabBarIcon: ({ focused, color }) => (
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Icon name={tab.icon} size={24} color={color} strokeWidth={focused ? 2.6 : 2} />
                  </View>
                ),
              }}
            />
          ))}
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}

const StyleSheetHairline = Platform.select({ ios: 0.33, default: 0.5 });

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <DateProvider>
          <Root />
        </DateProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}
