import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ACTIVITY_LABELS, DIET_LABELS, GOAL_LABELS } from "@/lib/labels";
import { mealPlanFromDb, profileFromDb } from "@/lib/serialize";
import { buildShoppingList } from "@/lib/shopping";
import type { MealPlan, UserProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

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
            day: { type: "string", description: "Günün adı, ör. Pazartesi" },
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
    profile.allergies.length > 0 ? profile.allergies.join(", ") : "yok";
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

// Return the user's most recent saved plan.
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  const row = await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: { generatedAt: "desc" },
  });
  return NextResponse.json({ plan: row ? mealPlanFromDb(row) : null });
}

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY tanımlı değil. Lütfen .env dosyasına ekleyin.",
      },
      { status: 500 }
    );
  }

  const profileRow = await prisma.profile.findUnique({ where: { userId } });
  if (!profileRow) {
    return NextResponse.json(
      { error: "Önce profilini oluştur." },
      { status: 400 }
    );
  }
  const profile = profileFromDb(profileRow);

  const client = new Anthropic({ apiKey });

  let plan: MealPlan;
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
    plan = { ...data, generatedAt: new Date().toISOString() };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
    return NextResponse.json(
      { error: `Plan oluşturulamadı: ${msg}` },
      { status: 502 }
    );
  }

  // Persist the plan and rebuild the shopping list atomically.
  const shoppingItems = buildShoppingList(plan);
  const saved = await prisma.$transaction(async (tx) => {
    const row = await tx.mealPlan.create({
      data: {
        userId,
        summary: plan.summary,
        days: JSON.stringify(plan.days),
      },
    });
    await tx.shoppingItem.deleteMany({ where: { userId } });
    if (shoppingItems.length > 0) {
      await tx.shoppingItem.createMany({
        data: shoppingItems.map((item, i) => ({
          userId,
          name: item.name,
          amount: item.amount,
          checked: false,
          sort: i,
        })),
      });
    }
    return row;
  });

  return NextResponse.json({ plan: mealPlanFromDb(saved) });
}
