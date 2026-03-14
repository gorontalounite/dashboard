import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReportView } from "@/components/ReportView";
import { DailyChart } from "@/components/DailyChart";
import { PostInsightList } from "@/components/PostInsightList";
import type { ReportWithData } from "@/types";

export default async function PublicReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await prisma.report.findUnique({
    where: { shareToken: token },
    include: {
      metrics: true,
      audienceData: true,
      dailyMetrics: { orderBy: { date: "asc" } },
      postInsights: { orderBy: { publishedAt: "desc" } },
    },
  });

  if (!report || !report.isPublic) notFound();

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
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <ReportView report={serialized} isPublic />
        {report.dailyMetrics.length > 0 && (
          <div className="mt-8">
            <DailyChart dailyMetrics={serialized.dailyMetrics} />
          </div>
        )}
        {report.postInsights.length > 0 && (
          <div className="mt-8">
            <PostInsightList posts={serialized.postInsights} />
          </div>
        )}
      </div>
    </div>
  );
}