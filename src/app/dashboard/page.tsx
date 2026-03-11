import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { OverviewClient } from "@/components/OverviewClient";
import type { ContentType } from "@/types";

type Props = {
  searchParams: Promise<{ period?: string; month?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { period, month } = await searchParams;
  const currentFilter = period ?? "3";

  let dateFilter: Date | null = null;
  if (currentFilter !== "all") {
    const months = parseInt(currentFilter);
    dateFilter = new Date();
    dateFilter.setMonth(dateFilter.getMonth() - months);
  }

  const whereClause = dateFilter ? { periodStart: { gte: dateFilter } } : {};

  const reports = await prisma.report.findMany({
    where: whereClause,
    orderBy: { periodStart: "desc" },
    take: 10,
    include: {
      metrics: {
        select: { views: true, interactions: true, accountsReached: true },
      },
    },
  });

  const totalReports = await prisma.report.count({ where: whereClause });
  const totalViews = reports.reduce((acc, r) => acc + (r.metrics?.views ?? 0), 0);
  const totalInteractions = reports.reduce((acc, r) => acc + (r.metrics?.interactions ?? 0), 0);
  const totalReached = reports.reduce((acc, r) => acc + (r.metrics?.accountsReached ?? 0), 0);

  const allReports = await prisma.report.findMany({
    orderBy: { periodStart: "desc" },
    select: { id: true, title: true, periodStart: true, periodEnd: true },
  });

  let selectedReportData: {
    dailyMetrics: { id: string; reportId: string; date: string; views: number; reach: number; interactions: number; follows: number; profileVisits: number; linkClicks: number }[];
    postInsights: { id: string; reportId: string; postId: string | null; permalink: string | null; caption: string | null; type: ContentType; publishedAt: string | null; views: number; reach: number; likes: number; comments: number; saves: number; shares: number; follows: number; duration: number }[];
    report: { id: string; title: string; periodStart: string; periodEnd: string } | null;
  } | null = null;

  if (month) {
    const selectedReport = await prisma.report.findUnique({
      where: { id: month },
      include: {
        dailyMetrics: { orderBy: { date: "asc" } },
        postInsights: { orderBy: { publishedAt: "desc" } },
      },
    });
    if (selectedReport) {
      selectedReportData = {
        report: {
          id: selectedReport.id,
          title: selectedReport.title,
          periodStart: selectedReport.periodStart.toISOString(),
          periodEnd: selectedReport.periodEnd.toISOString(),
        },
        dailyMetrics: selectedReport.dailyMetrics.map((d) => ({
          id: d.id,
          reportId: d.reportId,
          date: d.date.toISOString(),
          views: d.views,
          reach: d.reach,
          interactions: d.interactions,
          follows: d.follows,
          profileVisits: d.profileVisits,
          linkClicks: d.linkClicks,
        })),
        postInsights: selectedReport.postInsights.map((p) => ({
          id: p.id,
          reportId: p.reportId,
          postId: p.postId,
          permalink: p.permalink,
          caption: p.caption,
          type: p.type as ContentType,
          publishedAt: p.publishedAt?.toISOString() ?? null,
          views: p.views,
          reach: p.reach,
          likes: p.likes,
          comments: p.comments,
          saves: p.saves,
          shares: p.shares,
          follows: p.follows,
          duration: p.duration,
        })),
      };
    }
  }

  const serializedReports = reports.map((r) => ({
    id: r.id,
    title: r.title,
    accountName: r.accountName,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
    isPublic: r.isPublic,
    metrics: r.metrics
      ? {
          views: r.metrics.views,
          interactions: r.metrics.interactions,
          accountsReached: r.metrics.accountsReached,
        }
      : null,
  }));

  const serializedAllReports = allReports.map((r) => ({
    id: r.id,
    title: r.title,
    periodStart: r.periodStart.toISOString(),
    periodEnd: r.periodEnd.toISOString(),
  }));

  return (
    <Suspense fallback={<div className="text-white/30 p-8">Memuat...</div>}>
      <OverviewClient
        reports={serializedReports}
        totalReports={totalReports}
        totalViews={totalViews}
        totalInteractions={totalInteractions}
        totalReached={totalReached}
        currentFilter={currentFilter}
        userName={session?.user?.name?.split(" ")[0] ?? "Admin"}
        allReports={serializedAllReports}
        selectedMonth={month ?? null}
        selectedReportData={selectedReportData}
      />
    </Suspense>
  );
}