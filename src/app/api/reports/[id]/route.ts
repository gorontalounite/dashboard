import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const includeAll = {
  metrics: true,
  contentStats: true,
  topContent: { orderBy: { rank: "asc" as const } },
  audienceData: true,
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

  // Update report basic info
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

  // Update metrics
  await prisma.metrics.upsert({
    where: { reportId: id },
    create: {
      reportId: id,
      views: Number(body.views) || 0,
      viewsFromAds: Number(body.viewsFromAds) || 0,
      viewsFollowers: Number(body.viewsFollowers) || 0,
      viewsNonFollowers: Number(body.viewsNonFollowers) || 0,
      accountsReached: Number(body.accountsReached) || 0,
      accountsReachedChange: Number(body.accountsReachedChange) || 0,
      interactions: Number(body.interactions) || 0,
      interactionsFromAds: Number(body.interactionsFromAds) || 0,
      interactionsFollowers: Number(body.interactionsFollowers) || 0,
      interactionsNonFollowers: Number(body.interactionsNonFollowers) || 0,
      likes: Number(body.likes) || 0,
      comments: Number(body.comments) || 0,
      saves: Number(body.saves) || 0,
      shares: Number(body.shares) || 0,
      reposts: Number(body.reposts) || 0,
      profileVisits: Number(body.profileVisits) || 0,
      profileVisitsChange: Number(body.profileVisitsChange) || 0,
      externalLinkTaps: Number(body.externalLinkTaps) || 0,
      externalLinkTapsChange: Number(body.externalLinkTapsChange) || 0,
      followsGained: Number(body.followsGained) || 0,
      unfollows: Number(body.unfollows) || 0,
      netFollowerGrowth: Number(body.netFollowerGrowth) || 0,
    },
    update: {
      views: Number(body.views) || 0,
      viewsFromAds: Number(body.viewsFromAds) || 0,
      viewsFollowers: Number(body.viewsFollowers) || 0,
      viewsNonFollowers: Number(body.viewsNonFollowers) || 0,
      accountsReached: Number(body.accountsReached) || 0,
      accountsReachedChange: Number(body.accountsReachedChange) || 0,
      interactions: Number(body.interactions) || 0,
      interactionsFromAds: Number(body.interactionsFromAds) || 0,
      interactionsFollowers: Number(body.interactionsFollowers) || 0,
      interactionsNonFollowers: Number(body.interactionsNonFollowers) || 0,
      likes: Number(body.likes) || 0,
      comments: Number(body.comments) || 0,
      saves: Number(body.saves) || 0,
      shares: Number(body.shares) || 0,
      reposts: Number(body.reposts) || 0,
      profileVisits: Number(body.profileVisits) || 0,
      profileVisitsChange: Number(body.profileVisitsChange) || 0,
      externalLinkTaps: Number(body.externalLinkTaps) || 0,
      externalLinkTapsChange: Number(body.externalLinkTapsChange) || 0,
      followsGained: Number(body.followsGained) || 0,
      unfollows: Number(body.unfollows) || 0,
      netFollowerGrowth: Number(body.netFollowerGrowth) || 0,
    },
  });

  // Delete & recreate content stats
  await prisma.contentStat.deleteMany({ where: { reportId: id } });
  await prisma.contentStat.createMany({
    data: [
      { reportId: id, type: "REELS", viewsPct: Number(body.reelsViewsPct) || 0, interactionsPct: Number(body.reelsInteractionsPct) || 0 },
      { reportId: id, type: "STORIES", viewsPct: Number(body.storiesViewsPct) || 0, interactionsPct: Number(body.storiesInteractionsPct) || 0 },
      { reportId: id, type: "POSTS", viewsPct: Number(body.postsViewsPct) || 0, interactionsPct: Number(body.postsInteractionsPct) || 0 },
    ],
  });

  // Delete & recreate top content
  await prisma.topContent.deleteMany({ where: { reportId: id } });
  const topContents = [1, 2, 3, 4].map((n) => ({
    reportId: id,
    rank: n,
    caption: (body[`topContent${n}Caption`] as string) || "",
    views: Number(body[`topContent${n}Views`]) || 0,
    type: (body[`topContent${n}Type`] as "REELS" | "STORIES" | "POSTS" | "VIDEOS") || "REELS",
    publishedAt: body[`topContent${n}Date`] ? new Date(body[`topContent${n}Date`] as string) : null,
  })).filter((c) => c.caption || c.views);
  if (topContents.length > 0) {
    await prisma.topContent.createMany({ data: topContents });
  }

  // Update audience data
  await prisma.audienceData.upsert({
    where: { reportId: id },
    create: {
      reportId: id,
      genderMen: Number(body.genderMen) || 0,
      genderWomen: Number(body.genderWomen) || 0,
      age13to17: Number(body.age13to17) || 0,
      age18to24: Number(body.age18to24) || 0,
      age25to34: Number(body.age25to34) || 0,
      age35to44: Number(body.age35to44) || 0,
      age45to54: Number(body.age45to54) || 0,
      age55to64: Number(body.age55to64) || 0,
      age65plus: Number(body.age65plus) || 0,
      topCity1: (body.topCity1 as string) || "",
      topCity1Pct: Number(body.topCity1Pct) || 0,
      topCity2: (body.topCity2 as string) || "",
      topCity2Pct: Number(body.topCity2Pct) || 0,
      topCity3: (body.topCity3 as string) || "",
      topCity3Pct: Number(body.topCity3Pct) || 0,
      topCity4: (body.topCity4 as string) || "",
      topCity4Pct: Number(body.topCity4Pct) || 0,
      topCity5: (body.topCity5 as string) || "",
      topCity5Pct: Number(body.topCity5Pct) || 0,
    },
    update: {
      genderMen: Number(body.genderMen) || 0,
      genderWomen: Number(body.genderWomen) || 0,
      age13to17: Number(body.age13to17) || 0,
      age18to24: Number(body.age18to24) || 0,
      age25to34: Number(body.age25to34) || 0,
      age35to44: Number(body.age35to44) || 0,
      age45to54: Number(body.age45to54) || 0,
      age55to64: Number(body.age55to64) || 0,
      age65plus: Number(body.age65plus) || 0,
      topCity1: (body.topCity1 as string) || "",
      topCity1Pct: Number(body.topCity1Pct) || 0,
      topCity2: (body.topCity2 as string) || "",
      topCity2Pct: Number(body.topCity2Pct) || 0,
      topCity3: (body.topCity3 as string) || "",
      topCity3Pct: Number(body.topCity3Pct) || 0,
      topCity4: (body.topCity4 as string) || "",
      topCity4Pct: Number(body.topCity4Pct) || 0,
      topCity5: (body.topCity5 as string) || "",
      topCity5Pct: Number(body.topCity5Pct) || 0,
    },
  });

  return NextResponse.json({ success: true, id });
}