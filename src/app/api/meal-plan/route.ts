import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { MealPlan, UserProfile } from "@/lib/types";
import {
  ACTIVITY_LABELS,
  DIET_LABELS,
  GOAL_LABELS,
} from "@/lib/labels";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

// Tool schema forces Claude to return a structured meal plan.
const mealPlanTool: Anthropic.Tool = {
  name: "save_meal_plan",
  description: "Kullanıcı için oluşturulan haftalık öğün planını kaydeder.",
  input_schema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description:
          "Planın 1-2 cümlelik özeti ve kullanıcıya kısa bir motivasyon notu.",
      },
      days: {
        type: "array",
        description: "Haftanın 7 günü için öğün planı.",
        items: {
          type: "object",
          properties: {
            day: {
              type: "string",
              description: "Günün adı, ör. Pazartesi",
            },
            meals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["breakfast", "lunch", "dinner", "snack"],
                  },
                  name: { type: "string", description: "Öğün/yemek adı" },
                  calories: { type: "number" },
                  protein: { type: "number", description: "gram" },
                  carbs: { type: "number", description: "gram" },
                  fat: { type: "number", description: "gram" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        amount: {
                          type: "string",
                          description: "ör. 100 g, 1 adet, 2 yemek kaşığı",
                        },
                      },
                      required: ["name", "amount"],
                    },
                  },
                  recipe: {
                    type: "string",
                    description: "Kısa, adım adım hazırlama tarifi.",
                  },
                },
                required: [
                  "type",
                  "name",
                  "calories",
                  "protein",
                  "carbs",
                  "fat",
                  "ingredients",
                  "recipe",
                ],
              },
            },
          },
          required: ["day", "meals"],
        },
      },
    },
    required: ["summary", "days"],
  },
};

function buildPrompt(profile: UserProfile): string {
  const allergies =
    profile.allergies.length > 0
      ? profile.allergies.join(", ")
      : "yok";
  return `Aşağıdaki kullanıcı için 7 günlük, kişiselleştirilmiş ve sağlıklı bir öğün planı oluştur.

Kullanıcı bilgileri:
- İsim: ${profile.name}
- Yaş: ${profile.age}, Cinsiyet: ${profile.gender === "male" ? "Erkek" : "Kadın"}
- Boy: ${profile.heightCm} cm, Kilo: ${profile.weightKg} kg
- Hedef: ${GOAL_LABELS[profile.goal]}
- Aktivite seviyesi: ${ACTIVITY_LABELS[profile.activityLevel]}
- Diyet tipi: ${DIET_LABELS[profile.dietType]}
- Alerjiler/kaçınılacaklar: ${allergies}
- Günde öğün sayısı: ${profile.mealsPerDay}

Beslenme hedefleri (BUNLARA SADIK KAL):
- Günlük kalori: ~${profile.targetCalories} kcal
- Protein: ~${profile.targetMacros.protein} g
- Karbonhidrat: ~${profile.targetMacros.carbs} g
- Yağ: ~${profile.targetMacros.fat} g

Kurallar:
- Her gün ${profile.mealsPerDay} öğün olsun ve toplam günlük kalori hedefe ±5% içinde kalsın.
- ${DIET_LABELS[profile.dietType]} diyetine uygun, Türk mutfağına da yer veren, çeşitli ve pratik yemekler seç.
- Alerjenlerden kesinlikle kaçın.
- Tüm metinler Türkçe olsun.
- Sonucu yalnızca save_meal_plan aracını çağırarak döndür.`;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY tanımlı değil. Lütfen .env.local dosyasına ekleyin.",
      },
      { status: 500 }
    );
  }

  let profile: UserProfile;
  try {
    const body = await req.json();
    profile = body.profile;
    if (!profile || !profile.targetCalories) {
      throw new Error("Geçersiz profil");
    }
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      tools: [mealPlanTool],
      tool_choice: { type: "tool", name: "save_meal_plan" },
      messages: [{ role: "user", content: buildPrompt(profile) }],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      return NextResponse.json(
        { error: "Model bir plan döndürmedi." },
        { status: 502 }
      );
    }

    const data = toolUse.input as Omit<MealPlan, "generatedAt">;
    const plan: MealPlan = {
      ...data,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ plan });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Plan oluşturulamadı: ${msg}` },
      { status: 502 }
    );
  }
}
