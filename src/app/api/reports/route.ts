// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSafeFloat, parseSafeInt } from "@/lib/utils";
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
      metrics: {
        create: {
          views: parseSafeInt(data.views),
          viewsFromAds: parseSafeFloat(data.viewsFromAds),
          viewsFollowers: parseSafeFloat(data.viewsFollowers),
          viewsNonFollowers: parseSafeFloat(data.viewsNonFollowers),
          accountsReached: parseSafeInt(data.accountsReached),
          accountsReachedChange: parseSafeFloat(data.accountsReachedChange),
          interactions: parseSafeInt(data.interactions),
          interactionsFromAds: parseSafeFloat(data.interactionsFromAds),
          interactionsFollowers: parseSafeFloat(data.interactionsFollowers),
          interactionsNonFollowers: parseSafeFloat(data.interactionsNonFollowers),
          likes: parseSafeInt(data.likes),
          comments: parseSafeInt(data.comments),
          saves: parseSafeInt(data.saves),
          shares: parseSafeInt(data.shares),
          reposts: parseSafeInt(data.reposts),
          profileVisits: parseSafeInt(data.profileVisits),
          profileVisitsChange: parseSafeFloat(data.profileVisitsChange),
          externalLinkTaps: parseSafeInt(data.externalLinkTaps),
          externalLinkTapsChange: parseSafeFloat(data.externalLinkTapsChange),
          followsGained: parseSafeInt(data.followsGained),
          unfollows: parseSafeInt(data.unfollows),
          netFollowerGrowth: parseSafeInt(data.netFollowerGrowth),
        },
      },
      contentStats: {
        createMany: {
          data: [
            { type: "REELS", viewsPct: parseSafeFloat(data.reelsViewsPct), interactionsPct: parseSafeFloat(data.reelsInteractionsPct) },
            { type: "STORIES", viewsPct: parseSafeFloat(data.storiesViewsPct), interactionsPct: parseSafeFloat(data.storiesInteractionsPct) },
            { type: "POSTS", viewsPct: parseSafeFloat(data.postsViewsPct), interactionsPct: parseSafeFloat(data.postsInteractionsPct) },
          ],
        },
      },
      topContent: {
        createMany: {
          data: [
            { rank: 1, caption: data.topContent1Caption, views: parseSafeInt(data.topContent1Views), type: data.topContent1Type, publishedAt: data.topContent1Date ? new Date(data.topContent1Date) : null },
            { rank: 2, caption: data.topContent2Caption, views: parseSafeInt(data.topContent2Views), type: data.topContent2Type, publishedAt: data.topContent2Date ? new Date(data.topContent2Date) : null },
            { rank: 3, caption: data.topContent3Caption, views: parseSafeInt(data.topContent3Views), type: data.topContent3Type, publishedAt: data.topContent3Date ? new Date(data.topContent3Date) : null },
            { rank: 4, caption: data.topContent4Caption, views: parseSafeInt(data.topContent4Views), type: data.topContent4Type, publishedAt: data.topContent4Date ? new Date(data.topContent4Date) : null },
          ],
        },
      },
      audienceData: {
        create: {
          genderMen: parseSafeFloat(data.genderMen),
          genderWomen: parseSafeFloat(data.genderWomen),
          age13to17: parseSafeFloat(data.age13to17),
          age18to24: parseSafeFloat(data.age18to24),
          age25to34: parseSafeFloat(data.age25to34),
          age35to44: parseSafeFloat(data.age35to44),
          age45to54: parseSafeFloat(data.age45to54),
          age55to64: parseSafeFloat(data.age55to64),
          age65plus: parseSafeFloat(data.age65plus),
          topCity1: data.topCity1 || null,
          topCity1Pct: parseSafeFloat(data.topCity1Pct),
          topCity2: data.topCity2 || null,
          topCity2Pct: parseSafeFloat(data.topCity2Pct),
          topCity3: data.topCity3 || null,
          topCity3Pct: parseSafeFloat(data.topCity3Pct),
          topCity4: data.topCity4 || null,
          topCity4Pct: parseSafeFloat(data.topCity4Pct),
          topCity5: data.topCity5 || null,
          topCity5Pct: parseSafeFloat(data.topCity5Pct),
        },
      },
    },
  });

  return NextResponse.json(report, { status: 201 });
}
