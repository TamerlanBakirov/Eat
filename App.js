/* FitLife — Beslenme & Antrenman Takibi (Eat + Gym birleşimi) */
import React from "react";
import { Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DataProvider, DateProvider, useData } from "./src/lib/store";
import { palettes } from "./src/theme";
import DashboardScreen from "./src/screens/DashboardScreen";
import NutritionScreen from "./src/screens/NutritionScreen";
import WorkoutScreen from "./src/screens/WorkoutScreen";
import ProgressScreen from "./src/screens/ProgressScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TABS = [
  { name: "Özet", component: DashboardScreen, icon: "📊" },
  { name: "Beslenme", component: NutritionScreen, icon: "🍎" },
  { name: "Antrenman", component: WorkoutScreen, icon: "🏋️" },
  { name: "İlerleme", component: ProgressScreen, icon: "📈" },
  { name: "Profil", component: ProfileScreen, icon: "👤" },
];

function Root() {
  const { state } = useData();
  const themeName = state.settings.theme;
  const c = palettes[themeName] || palettes.dark;

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

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.primary,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            backgroundColor: c.surface,
            borderTopColor: c.border,
          },
          tabBarLabelStyle: { fontWeight: "600", fontSize: 11 },
        }}
      >
        {TABS.map((tab) => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.55 }}>{tab.icon}</Text>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

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
