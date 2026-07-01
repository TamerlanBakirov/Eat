# 🥗 Eat — AI Sağlıklı Diyet & Öğün Planı

[Eatr](https://apps.apple.com/hu/app/eatr-ai-healthy-diet-meal-plan/id6479693198) tarzı, yapay zeka destekli tam kapsamlı (full-stack) bir diyet ve öğün planı uygulaması. Web tabanlı (Next.js), telefonda da PWA gibi çalışır.

## Özellikler

- **Kullanıcı hesapları** — E-posta/şifre ile kayıt & giriş, JWT tabanlı oturum (httpOnly cookie), bcrypt ile şifre hash'leme.
- **Onboarding + kalori hesabı** — Yaş, boy, kilo, hedef ve aktivite seviyesine göre Mifflin-St Jeor formülüyle günlük kalori (BMR/TDEE) ve makro hedefleri.
- **AI kişisel öğün planı** — Claude API ile profiline ve diyet tipine uygun 7 günlük öğün planı, tarifler ve makro dağılımı. Plan veritabanına kaydedilir.
- **Yemek / kalori takibi** — Günlük yenenleri kaydet; kalori halkası ve makro çubuklarıyla anlık ilerleme. Tüm kayıtlar hesabına bağlı.
- **Otomatik alışveriş listesi** — Öğün planındaki tüm malzemeler tek bir market listesinde toplanır, işaretlenebilir.

Tüm veriler **sunucudaki veritabanında** (kullanıcı bazlı) saklanır.

## Mimari

**Frontend**
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Zustand (sunucuya bağlı in-memory state)

**Backend**
- Next.js Route Handlers (`/api/*`)
- Prisma ORM + SQLite (production'da `DATABASE_URL` ile Postgres'e geçilebilir)
- `jose` (JWT) + `bcryptjs` (şifre hash) ile kimlik doğrulama
- `@anthropic-ai/sdk` (Claude API, structured tool output)

### API uçları

| Uç | Yöntem | Açıklama |
| --- | --- | --- |
| `/api/auth/register` | POST | Kayıt + oturum |
| `/api/auth/login` | POST | Giriş |
| `/api/auth/logout` | POST | Çıkış |
| `/api/auth/me` | GET | Oturumdaki kullanıcı |
| `/api/profile` | GET / PUT | Profil oku / kaydet |
| `/api/meal-plan` | GET / POST | Mevcut plan / AI ile yeni plan üret |
| `/api/food` | GET / POST / DELETE | Yemek günlüğü |
| `/api/shopping` | GET / PATCH | Alışveriş listesi / öğe işaretle |

Tüm veri uçları oturum çerezini doğrular; kullanıcılar yalnızca kendi verilerine erişir.

### Veri modeli (Prisma)

`User` → `Profile` (1-1), `MealPlan[]`, `FoodEntry[]`, `ShoppingItem[]` (hepsi `onDelete: Cascade`).

## Kurulum

```bash
npm install                  # bağımlılıklar + prisma generate
cp .env.example .env         # DATABASE_URL, AUTH_SECRET, ANTHROPIC_API_KEY
npm run db:push              # veritabanı şemasını oluştur
npm run dev
```

Ardından http://localhost:3000 adresini aç, hesap oluştur ve onboarding'i tamamla.

### Ortam değişkenleri (`.env`)

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | Veritabanı bağlantısı. Varsayılan: `file:./dev.db` (SQLite) |
| `AUTH_SECRET` | JWT imzalama anahtarı (en az 32 karakter rastgele değer) |
| `ANTHROPIC_API_KEY` | AI öğün planı için Claude API anahtarı |

> AI plan üretimi için geçerli bir `ANTHROPIC_API_KEY` gerekir. Diğer tüm
> özellikler anahtar olmadan da çalışır.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Production derlemesi (`prisma generate` + `next build`) |
| `npm run start` | Production sunucusu |
| `npm run db:push` | Prisma şemasını veritabanına uygula |
| `npm run lint` | Lint |

## Yol Haritası (sonraki adımlar)

- Fotoğraftan kalori tahmini (AI görüntü analizi)
- Su takibi ve kilo grafiği geçmişi
- Postgres + bulut dağıtımı (Vercel + Neon/Supabase)
- Mobil uygulama (React Native / Expo)
