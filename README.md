# 🥗 Eat — AI Sağlıklı Diyet & Öğün Planı

[Eatr](https://apps.apple.com/hu/app/eatr-ai-healthy-diet-meal-plan/id6479693198) tarzı, yapay zeka destekli bir diyet ve öğün planı uygulaması. Web tabanlı (Next.js), telefonda da PWA gibi çalışır.

## Özellikler

- **Onboarding + kalori hesabı** — Yaş, boy, kilo, hedef ve aktivite seviyesine göre Mifflin-St Jeor formülüyle günlük kalori (BMR/TDEE) ve makro hedefleri.
- **AI kişisel öğün planı** — Claude API ile profiline ve diyet tipine uygun 7 günlük öğün planı, tarifler ve makro dağılımı.
- **Yemek / kalori takibi** — Günlük yenenleri kaydet; kalori halkası ve makro çubuklarıyla anlık ilerleme.
- **Otomatik alışveriş listesi** — Öğün planındaki tüm malzemeler tek bir market listesinde toplanır.

Tüm veriler tarayıcıda (localStorage) saklanır; ayrı bir veritabanı gerekmez.

## Teknolojiler

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (kalıcı state)
- `@anthropic-ai/sdk` (Claude API)

## Kurulum

```bash
npm install
cp .env.example .env.local   # ANTHROPIC_API_KEY değerini gir
npm run dev
```

Ardından http://localhost:3000 adresini aç.

> AI öğün planı için geçerli bir `ANTHROPIC_API_KEY` gerekir. Anahtar olmadan da
> uygulama çalışır; yalnızca "Planımı oluştur" adımında uyarı görürsün.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production derlemesi |
| `npm run start` | Production sunucusu |
| `npm run lint` | Lint |

## Yol Haritası (sonraki adımlar)

- Fotoğraftan kalori tahmini (AI görüntü analizi)
- Kullanıcı hesabı + bulut senkronizasyonu
- Su takibi ve kilo grafiği geçmişi
- Mobil uygulama (React Native / Expo)
