/* İlerleme fotoğrafları — kalıcı depolama (expo-file-system). Web'de picked uri korunur. */
import * as FileSystem from "expo-file-system";

const DIR = FileSystem.documentDirectory ? FileSystem.documentDirectory + "progress/" : null;

export async function savePhoto(srcUri) {
  if (!DIR) return srcUri; // web fallback: doğrudan uri kullan
  try { await FileSystem.makeDirectoryAsync(DIR, { intermediates: true }); } catch {}
  const dest = `${DIR}${Date.now()}.jpg`;
  try {
    await FileSystem.copyAsync({ from: srcUri, to: dest });
    return dest;
  } catch {
    return srcUri;
  }
}

export async function deletePhoto(uri) {
  if (!DIR || !uri || !uri.startsWith(DIR)) return;
  try { await FileSystem.deleteAsync(uri, { idempotent: true }); } catch {}
}
