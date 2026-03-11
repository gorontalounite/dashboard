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
      dailyMetrics: { orderBy: { date: "asc" } },
      postInsights: { orderBy: { publishedAt: "desc" } },