import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  const rows = await prisma.shoppingItem.findMany({
    where: { userId },
    orderBy: { sort: "asc" },
  });
  return NextResponse.json({ items: rows });
}

// Toggle a single item's checked state.
export async function PATCH(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }
  let id: string;
  let checked: boolean;
  try {
    const body = await req.json();
    id = String(body.id);
    checked = Boolean(body.checked);
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  await prisma.shoppingItem.updateMany({
    where: { id, userId },
    data: { checked },
  });
  return NextResponse.json({ ok: true });
}
