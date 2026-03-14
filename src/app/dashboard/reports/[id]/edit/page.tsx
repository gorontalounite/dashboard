import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { DailyChart } from "@/components/DailyChart";
import { PostInsightList } from "@/components/PostInsightList";
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
      audienceData: true,
      dailyMetrics: { orderBy: { date: "asc" } },
      postInsights: { orderBy: { publishedAt: "desc" } },
    },
  });

  if (!report) notFound();

  const serialized: ReportWithData = {
    ...report,
    periodStart: report.periodStart.toISOString(),
    periodEnd: report.periodEnd.toISOString(),
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
    dailyMetrics: report.dailyMetrics.map((d) => ({
      ...d,
      date: d.date.toISOString(),
    })),
    postInsights: report.postInsights.map((p) => ({
      ...p,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    })),
  };

  return (
    <div>
      <ReportView report={serialized} />
      {report.dailyMetrics.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-8">
          <DailyChart dailyMetrics={serialized.dailyMetrics} />
        </div>
      )}
      {report.postInsights.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-12">
          <PostInsightList posts={serialized.postInsights} />
        </div>
      )}
    </div>
  );
}