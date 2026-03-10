import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { OverviewClient } from "@/components/OverviewClient";

type Props = {
  searchParams: Promise<{ period?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const { period } = await searchParams;
  const currentFilter = period ?? "3";

  // Calculate date filter
  let dateFilter: Date | null = null;
  if (currentFilter !== "all") {
    const months = parseInt(currentFilter);
    dateFilter = new Date();
    dateFilter.setMonth(dateFilter.getMonth() - months);
  }

  const whereClause = dateFilter
    ? { periodStart: { gte: dateFilter } }
    : {};

  const reports = await prisma.report.findMany({
    where: whereClause,
    orderBy: { periodStart: "desc" },
    take: 10,
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

  const totalReports = await prisma.report.count({ where: whereClause });

  const totalViews = reports.reduce(
    (acc, r) => acc + (r.metrics?.views ?? 0), 0
  );
  const totalInteractions = reports.reduce(
    (acc, r) => acc + (r.metrics?.interactions ?? 0), 0
  );
  const totalReached = reports.reduce(
    (acc, r) => acc + (r.metrics?.accountsReached ?? 0), 0
  );

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
      />
    </Suspense>
  );
}