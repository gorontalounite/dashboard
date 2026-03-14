import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const post = await prisma.postInsight.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(post);
}
