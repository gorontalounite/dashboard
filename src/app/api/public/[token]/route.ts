import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  const report = await prisma.report.findUnique({
    where: { shareToken: token },
    include: {
      metrics: true,
      contentStats: true,
      topContent: { orderBy: { rank: "asc" } },
      audienceData: true,
    },
  });

  if (!report || !report.isPublic) {
    return NextResponse.json({ error: "Report not found or not public" }, { status: 404 });
  }

  return NextResponse.json(report);
}