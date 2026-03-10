// src/app/report/[token]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import type { ReportWithData } from "@/types";

export default async function PublicReportPage({
  params,
}: {
  params: { token: string };
}) {
  const report = await prisma.report.findUnique({
    where: { shareToken: params.token },
    include: {
      metrics: true,
      contentStats: true,
      topContent: { orderBy: { rank: "asc" } },
      audienceData: true,
    },
  });

  if (!report || !report.isPublic) notFound();

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

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ReportView report={serialized} isPublic />
      </div>
    </div>
  );
}
