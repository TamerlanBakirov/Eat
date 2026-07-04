/* Yerel bildirimler — su hatırlatma + antrenman günü. Expo Go / cihazda çalışır, web'de no-op. */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const WATER_HOURS = [10, 13, 16, 19, 21];
const supported = Platform.OS !== "web";

export function initNotifications() {
  if (!supported) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  } catch {}
}

export async function ensurePermission() {
  if (!supported) return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  } catch { return false; }
}

async function cancelTag(tag) {
  if (!supported) return;
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content?.data?.tag === tag) await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  } catch {}
}

export async function setWaterReminders(on) {
  if (!supported) return false;
  await cancelTag("water");
  if (!on) return true;
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    for (const hour of WATER_HOURS) {
      await Notifications.scheduleNotificationAsync({
        content: { title: "💧 Su içme vakti", body: "Bir bardak su içmeyi unutma.", data: { tag: "water" } },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
      });
    }
    return true;
  } catch { return false; }
}

export async function setWorkoutReminder(on, hour = 18) {
  if (!supported) return false;
  await cancelTag("workout");
  if (!on) return true;
  const ok = await ensurePermission();
  if (!ok) return false;
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: "🏋️ Antrenman zamanı", body: "Bugünkü antrenmanını tamamlamayı unutma!", data: { tag: "workout" } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0 },
    });
    return true;
  } catch { return false; }
}
