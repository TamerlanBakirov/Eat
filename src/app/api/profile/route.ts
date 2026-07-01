import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileFromDb, profileToDb } from "@/lib/serialize";
import type { UserProfile } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  const row = await prisma.profile.findUnique({ where: { userId } });
  return NextResponse.json({ profile: row ? profileFromDb(row) : null });
}

export async function PUT(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  let profile: UserProfile;
  try {
    const body = await req.json();
    profile = body.profile;
    if (!profile || !profile.targetCalories) throw new Error("invalid");
  } catch {
    return NextResponse.json({ error: "Geçersiz profil." }, { status: 400 });
  }

  const data = profileToDb(profile);
  const row = await prisma.profile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  return NextResponse.json({ profile: profileFromDb(row) });
}
