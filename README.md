# ⚡ FitLife — Beslenme & Antrenman Takibi (Mobil)

**Eat** ve **Gym** repolarındaki uygulamaların tek çatı altında birleştirilmiş halidir. **React Native (Expo)** ile geliştirilmiş bu mobil uygulama; beslenme günlüğü, antrenman kaydı, ilerleme takibi ve kişiselleştirilmiş hedefleri iOS ve Android'de tek kod tabanıyla sunar.

## Özellikler

### 📊 Özet (Dashboard)
- Günlük kalori dengesi: **alınan − yakılan = net** kalori takibi
- Kalori hedefi halka grafiği ve makro besin (protein / karbonhidrat / yağ) ilerleme çubukları
- Su takibi (bardak bazlı, dokunmatik)
- Son 7 günün alınan/yakılan kalori grafikleri
- Günün antrenman özeti

### 🍎 Beslenme (eski *Eat* uygulaması)
- 4 öğün bazlı yemek günlüğü: kahvaltı, öğle, akşam, ara öğün
- 60+ besinlik Türk mutfağı ağırlıklı besin veritabanı (100 g bazında kalori & makrolar)
- Gram bazlı porsiyon hesaplama ve anlık makro önizleme
- Özel besin oluşturma (kendi tariflerini veritabanına ekle)

### 🏋️ Antrenman (eski *Gym* uygulaması)
- 40+ egzersizlik kütüphane: göğüs, sırt, bacak, omuz, kol, karın, kardiyo
- Set / tekrar / ağırlık bazlı kuvvet antrenmanı kaydı; süre bazlı kardiyo kaydı
- 5 hazır program şablonu (Tüm Vücut, Push, Pull, Legs, Kardiyo)
- MET değerine göre otomatik kalori yakımı tahmini

### 📈 İlerleme
- Kilo takibi ve trend grafiği
- Son 14 günün kalori alım/yakım grafikleri
- Kişisel rekorlar (egzersiz başına en yüksek ağırlık)
- Kesintisiz kayıt serisi (streak) sayacı

### 👤 Profil
- Mifflin-St Jeor formülü ile **BMR** ve **TDEE** hesaplama
- Hedefe göre (verme / koruma / alma) otomatik günlük kalori ve makro hedefleri
- BMI hesaplama ve sınıflandırma
- Verileri JSON olarak paylaşma/yedekleme, tam sıfırlama
- Açık / koyu tema

## Çalıştırma

Gereksinimler: Node.js 18+ ve telefonda [Expo Go](https://expo.dev/go) uygulaması.

```bash
npm install

# Geliştirme sunucusunu başlat
npx expo start
```

- **Telefonda:** Terminaldeki QR kodu Expo Go ile (Android) veya Kamera ile (iOS) okut.
- **Android emülatörü:** `npx expo start --android`
- **iOS simülatörü (macOS):** `npx expo start --ios`
- **Tarayıcıda önizleme:** `npx expo start --web`

Mağaza sürümü (APK / IPA) üretmek için [EAS Build](https://docs.expo.dev/build/setup/) kullanılır:

```bash
npx eas build --platform android
npx eas build --platform ios
```

## Mimari

```
App.js                    Sağlayıcılar + alt sekme navigasyonu (react-navigation)
index.js                  Expo giriş noktası
src/
  theme.js                Açık/koyu renk paletleri
  data/foods.js           Besin veritabanı (100 g bazlı makrolar)
  data/exercises.js       Egzersiz veritabanı (MET değerleri) + program şablonları
  lib/utils.js            Tarih, format ve sağlık hesaplamaları (BMR/TDEE/BMI/MET)
  lib/store.js            React Context + reducer; AsyncStorage kalıcılığı
  components/ui.js        Ortak UI kiti: Card, StatTile, Btn, Sheet, OptionGroup...
  components/charts.js    react-native-svg grafikler: halka, çubuk, çizgi
  components/DateHeader.js Gün gezinme başlığı
  screens/                Özet, Beslenme, Antrenman, İlerleme, Profil ekranları
```

- **Durum yönetimi:** Tek `DataProvider` (Context + reducer); her değişiklik AsyncStorage'a yazılır, açılışta geri yüklenir.
- **Saf iş mantığı:** Tüm sağlık hesaplamaları ve seçiciler UI'dan bağımsız saf fonksiyonlardır (`lib/`).
- **Tema:** Palet tek kaynaktan (`theme.js`); navigasyon, grafikler ve tüm bileşenler temayı bağlamdan okur.

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Çatı | Expo SDK 53 / React Native 0.79 / React 19 |
| Navigasyon | React Navigation (bottom tabs) |
| Kalıcılık | AsyncStorage |
| Grafikler | react-native-svg (bağımlılıksız özel bileşenler) |

## Konsolidasyon Notu

Bu repo, daha önce ayrı olan iki projenin birleşimidir:

| Eski repo | Yeni modül |
|-----------|------------|
| `tamerlanbakirov/eat` | 🍎 Beslenme sekmesi |
| `tamerlanbakirov/gym` | 🏋️ Antrenman sekmesi |

İki alanın birleşmesiyle mümkün olan yeni özellikler: net kalori dengesi (alınan − yakılan), antrenman kalori yakımının beslenme hedefine yansıması ve tek profil üzerinden ortak hedef yönetimi.
