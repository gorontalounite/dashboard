import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { InputFormData } from "@/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      metrics: {
        select: {
          views: true,
          interactions: true,
          accountsReached: true,
        },
      },
    },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const data: InputFormData = await req.json();

  const report = await prisma.report.create({
    data: {
      title: data.title,
      accountName: data.accountName,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
      isPublic: data.isPublic,
      userId,
    },
  });

  return NextResponse.json(report, { status: 201 });
}