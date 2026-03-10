import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import type { ReportWithData } from "@/types";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      metrics: true,
      contentStats: true,
      topContent: { orderBy: { rank: "asc" } },
      audienceData: true,
    },
  });

  if (!report) notFound();

  const serialized: ReportWithData = {
    ...report,
    periodStart: report.periodStart.toISOString(),
    periodEnd: report.periodEnd.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    topContent: report.topContent.map((tc) => ({
      ...tc,
      publishedAt: tc.publishedAt ? tc.publishedAt.toISOString() : null,
    })),
  };

  return <ReportView report={serialized} />;
}