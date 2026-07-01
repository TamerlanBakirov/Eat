import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { MealType } from "@/lib/types";

export const runtime = "nodejs";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export async function GET(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date gerekli." }, { status: 400 });
  }
  const rows = await prisma.foodEntry.findMany({
    where: { userId, date },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ foods: rows });
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const date = String(body.date || "");
  const name = String(body.name || "").trim();
  const mealType = String(body.mealType || "") as MealType;
  if (!date || !name || !MEAL_TYPES.includes(mealType)) {
    return NextResponse.json({ error: "Eksik alanlar." }, { status: 400 });
  }

  const row = await prisma.foodEntry.create({
    data: {
      userId,
      date,
      name,
      mealType,
      calories: Number(body.calories) || 0,
      protein: Number(body.protein) || 0,
      carbs: Number(body.carbs) || 0,
      fat: Number(body.fat) || 0,
    },
  });
  return NextResponse.json({ food: row });
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }
  // deleteMany scopes by userId so users can only delete their own rows.
  await prisma.foodEntry.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
