import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseDate(dateStr: string): Date | null {
  try {
    const [datePart, timePart] = dateStr.trim().split(" ");
    const [month, day, year] = datePart.split("/");
    const [hour, minute] = (timePart ?? "00:00").split(":");
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: "Empty file" }, { status: 400 });

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^\uFEFF/, "").replace(/^"|"$/g, "").trim());

  const idx = {
    postId: headers.indexOf("Post ID"),
    accountUsername: headers.indexOf("Account username"),
    accountName: headers.indexOf("Account name"),
    description: headers.indexOf("Description"),
    duration: headers.indexOf("Duration (sec)"),
    publishTime: headers.indexOf("Publish time"),
    permalink: headers.indexOf("Permalink"),
    postType: headers.indexOf("Post type"),
    views: headers.indexOf("Views"),
    reach: headers.indexOf("Reach"),
    likes: headers.indexOf("Likes"),
    shares: headers.indexOf("Shares"),
    follows: headers.indexOf("Follows"),
    comments: headers.indexOf("Comments"),
    saves: headers.indexOf("Saves"),
  };

  // Group posts by account + month
  type PostGroup = {
    accountUsername: string;
    accountName: string;
    year: number;
    month: number;
    posts: {
      postId: string;
      permalink: string;
      caption: string;
      type: string;
      publishedAt: Date;
      views: number;
      reach: number;
      likes: number;
      shares: number;
      follows: number;
      comments: number;
      saves: number;
      duration: number;
    }[];
  };

  const groups: Record<string, PostGroup> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (!cols[idx.postId]) continue;

    const publishTime = cols[idx.publishTime] ?? "";
    const publishedAt = parseDate(publishTime);
    if (!publishedAt) continue;

    const accountUsername = cols[idx.accountUsername]?.replace(/^"|"$/g, "").trim() ?? "";
    const accountName = cols[idx.accountName]?.replace(/^"|"$/g, "").trim() ?? "";
    const year = publishedAt.getFullYear();
    const month = publishedAt.getMonth() + 1;
    const key = `${accountUsername}-${year}-${month}`;

    if (!groups[key]) {
      groups[key] = { accountUsername, accountName, year, month, posts: [] };
    }

    const rawType = cols[idx.postType]?.replace(/^"|"$/g, "").trim().toLowerCase() ?? "";
    let type = "REELS";
    if (rawType.includes("reel")) type = "REELS";
    else if (rawType.includes("story") || rawType.includes("stories")) type = "STORIES";
    else if (rawType.includes("video")) type = "VIDEOS";
    else if (rawType.includes("post") || rawType.includes("image") || rawType.includes("carousel")) type = "POSTS";

    groups[key].posts.push({
      postId: cols[idx.postId]?.trim() ?? "",
      permalink: cols[idx.permalink]?.replace(/^"|"$/g, "").trim() ?? "",
      caption: cols[idx.description]?.replace(/^"|"$/g, "").trim() ?? "",
      type,
      publishedAt,
      views: parseInt(cols[idx.views]) || 0,
      reach: parseInt(cols[idx.reach]) || 0,
      likes: parseInt(cols[idx.likes]) || 0,
      shares: parseInt(cols[idx.shares]) || 0,
      follows: parseInt(cols[idx.follows]) || 0,
      comments: parseInt(cols[idx.comments]) || 0,
      saves: parseInt(cols[idx.saves]) || 0,
      duration: parseInt(cols[idx.duration]) || 0,
    });
  }

  const results: { month: string; account: string; reportId: string; created: boolean; posts: number }[] = [];
  const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  for (const group of Object.values(groups)) {
    const { accountUsername, accountName, year, month, posts } = group;
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0, 23, 59, 59);
    const title = `${MONTH_NAMES[month - 1]} ${year}`;

    // Find or create report
    let report = await prisma.report.findFirst({
      where: {
        accountName: accountUsername,
        periodStart: { gte: new Date(year, month - 1, 1) },
        periodEnd: { lte: new Date(year, month, 0, 23, 59, 59) },
      },
    });

    let created = false;
    if (!report) {
      report = await prisma.report.create({
        data: {
          title,
          accountName: accountUsername,
          periodStart,
          periodEnd,
          userId: (session.user as { id?: string })?.id ?? "",
        },
      });
      created = true;
    }

    // Upsert posts
    for (const post of posts) {
      await prisma.postInsight.upsert({
        where: { id: post.postId },
        create: {
          id: post.postId,
          reportId: report.id,
          postId: post.postId,
          permalink: post.permalink,
          caption: post.caption,
          type: post.type as "REELS" | "STORIES" | "VIDEOS" | "POSTS",
          publishedAt: post.publishedAt,
          views: post.views,
          reach: post.reach,
          likes: post.likes,
          shares: post.shares,
          follows: post.follows,
          comments: post.comments,
          saves: post.saves,
          duration: post.duration,
        },
        update: {
          views: post.views,
          reach: post.reach,
          likes: post.likes,
          shares: post.shares,
          follows: post.follows,
          comments: post.comments,
          saves: post.saves,
          duration: post.duration,
        },
      });
    }

    results.push({
      month: title,
      account: accountUsername,
      reportId: report.id,
      created,
      posts: posts.length,
    });
  }

  return NextResponse.json({ success: true, results });
}
