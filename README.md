# ⚡ FitLife — Beslenme & Antrenman Takibi

**Eat** ve **Gym** repolarındaki uygulamaların tek çatı altında birleştirilmiş halidir. Beslenme günlüğü, antrenman kaydı, ilerleme takibi ve kişiselleştirilmiş hedefleri tek bir modern web uygulamasında sunar.

## Özellikler

### 📊 Özet (Dashboard)
- Günlük kalori dengesi: **alınan − yakılan = net** kalori takibi
- Kalori hedefi halka grafiği ve makro besin (protein / karbonhidrat / yağ) ilerleme çubukları
- Su takibi (bardak bazlı)
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
- Verileri JSON olarak dışa/içe aktarma, tam sıfırlama
- Açık / koyu tema

## Çalıştırma

Uygulama tamamen bağımlılıksızdır — derleme, paket yöneticisi veya sunucu gerektirmez.

```bash
# Seçenek 1: index.html dosyasını doğrudan tarayıcıda aç
open index.html

# Seçenek 2: Basit bir yerel sunucuyla servis et
python3 -m http.server 8000
# → http://localhost:8000
```

Veriler tarayıcının `localStorage` alanında saklanır; sunucu ya da hesap gerekmez.

## Mimari

```
index.html            Uygulama kabuğu (navigasyon, modal, toast)
css/style.css         Tasarım sistemi — CSS değişkenleri, açık/koyu tema, duyarlı yerleşim
js/
  data/foods.js       Besin veritabanı (100 g bazlı makrolar)
  data/exercises.js   Egzersiz veritabanı (MET değerleri) + program şablonları
  utils.js            Tarih, format ve sağlık hesaplamaları (BMR/TDEE/BMI/MET)
  store.js            Durum yönetimi + localStorage kalıcılığı
  charts.js           Bağımlılıksız SVG grafikler (halka, çubuk, çizgi)
  views/              Görünüm modülleri: dashboard, nutrition, workout, progress, profile
  app.js              Yönlendirme, tarih gezinme, tema, modal/toast altyapısı
```

- **Sıfır bağımlılık:** framework, bundler veya CDN yok; `file://` üzerinden bile çalışır.
- **Modüler yapı:** her görünüm kendi IIFE modülünde; veri katmanı (`Store`) UI'dan ayrık.
- **Tema desteği:** tüm renkler CSS değişkeni; grafikler tema değişiminde yeniden çizilir.

## Konsolidasyon Notu

Bu repo, daha önce ayrı olan iki projenin birleşimidir:

| Eski repo | Yeni modül |
|-----------|------------|
| `tamerlanbakirov/eat` | 🍎 Beslenme sekmesi |
| `tamerlanbakirov/gym` | 🏋️ Antrenman sekmesi |

İki alanın birleşmesiyle mümkün olan yeni özellikler: net kalori dengesi (alınan − yakılan), antrenman kalori yakımının beslenme hedefine yansıması ve tek profil üzerinden ortak hedef yönetimi.
