import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const includeAll = {
  metrics: true,
  audienceData: true,
  dailyMetrics: { orderBy: { date: "asc" as const } },
  postInsights: { orderBy: { publishedAt: "desc" as const } },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: includeAll,
  });

  if (!report) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(report);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body: { isPublic?: boolean } = await req.json();

  const report = await prisma.report.update({
    where: { id },
    data: { isPublic: body.isPublic },
  });

  return NextResponse.json(report);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.report.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;

  await prisma.report.update({
    where: { id },
    data: {
      title: body.title as string,
      accountName: body.accountName as string,
      periodStart: new Date(body.periodStart as string),
      periodEnd: new Date(body.periodEnd as string),
      isPublic: body.isPublic as boolean,
    },
  });

  return NextResponse.json({ success: true, id });
}