// src/app/api/reports/[id]/upload-csv/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PostRow = {
  postId: string;
  permalink: string;
  caption: string;
  type: "REELS" | "STORIES" | "POSTS" | "VIDEOS";
  publishedAt: Date | null;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  follows: number;
  duration: number;
};

type DailyRow = {
  date: Date;
  views: number;
  reach: number;
  interactions: number;
  follows: number;
  profileVisits: number;
  linkClicks: number;
};

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

function detectCSVType(headers: string[]): "posts" | "daily" | "unknown" {
  const headerStr = headers.join(",").toLowerCase();
  if (headerStr.includes("post id") || headerStr.includes("permalink")) return "posts";
  if (headerStr.includes("tayangan") || headerStr.includes("tanggal") || headerStr.includes("primary")) return "daily";
  if (headerStr.includes("date") && headerStr.includes("primary")) return "daily";
  return "unknown";
}

function mapPostType(type: string): "REELS" | "STORIES" | "POSTS" | "VIDEOS" {
  const t = type.toLowerCase();
  if (t.includes("reel")) return "REELS";
  if (t.includes("stor")) return "STORIES";
  if (t.includes("video")) return "VIDEOS";
  return "POSTS";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: reportId } = await params;

  // Verify report exists
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const results = { posts: 0, daily: 0, errors: [] as string[] };

  for (const file of files) {
    // Handle both UTF-8 and UTF-16 encodings
const buffer = await file.arrayBuffer();
const uint8 = new Uint8Array(buffer);

// Detect UTF-16 by BOM (FF FE or FE FF)
let cleanText: string;
if ((uint8[0] === 0xff && uint8[1] === 0xfe) || (uint8[0] === 0xfe && uint8[1] === 0xff)) {
  const decoder = new TextDecoder("utf-16");
  cleanText = decoder.decode(buffer);
} else {
  const decoder = new TextDecoder("utf-8");
  cleanText = decoder.decode(buffer).replace(/^\uFEFF/, "");
}

// Remove sep=, line if present (Business Suite adds this)
const lines_raw = cleanText.split("\n").filter((l) => l.trim());
const firstLine = lines_raw[0]?.trim().toLowerCase();
const csvLines = firstLine === "sep=," ? lines_raw.slice(1) : lines_raw;
    const lines = csvLines;
    if (lines.length < 2) continue;

    const headers = parseCSVLine(lines[0]);
    const csvType = detectCSVType(headers);

    if (csvType === "posts") {
      // Parse post insights CSV
      const postRows: PostRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 8) continue;

        const idx = {
          postId: headers.findIndex((h) => h.toLowerCase().includes("post id")),
          username: headers.findIndex((h) => h.toLowerCase().includes("username")),
          description: headers.findIndex((h) => h.toLowerCase().includes("description")),
          duration: headers.findIndex((h) => h.toLowerCase().includes("duration")),
          publishTime: headers.findIndex((h) => h.toLowerCase().includes("publish time")),
          permalink: headers.findIndex((h) => h.toLowerCase().includes("permalink")),
          postType: headers.findIndex((h) => h.toLowerCase().includes("post type")),
          date: headers.findIndex((h) => h.toLowerCase() === "date"),
          views: headers.findIndex((h) => h.toLowerCase() === "views"),
          reach: headers.findIndex((h) => h.toLowerCase() === "reach"),
          likes: headers.findIndex((h) => h.toLowerCase() === "likes"),
          shares: headers.findIndex((h) => h.toLowerCase() === "shares"),
          follows: headers.findIndex((h) => h.toLowerCase() === "follows"),
          comments: headers.findIndex((h) => h.toLowerCase() === "comments"),
          saves: headers.findIndex((h) => h.toLowerCase() === "saves"),
        };

        // Only process rows with "Lifetime" date (not daily breakdown)
        const dateVal = idx.date >= 0 ? cols[idx.date] : "";
        if (dateVal !== "Lifetime") continue;

        const permalink = idx.permalink >= 0 ? cols[idx.permalink] : "";
        if (!permalink) continue;

        let publishedAt: Date | null = null;
        if (idx.publishTime >= 0 && cols[idx.publishTime]) {
          const d = new Date(cols[idx.publishTime]);
          if (!isNaN(d.getTime())) publishedAt = d;
        }

        postRows.push({
          postId: idx.postId >= 0 ? cols[idx.postId] : "",
          permalink,
          caption: idx.description >= 0 ? cols[idx.description].slice(0, 500) : "",
          type: mapPostType(idx.postType >= 0 ? cols[idx.postType] : ""),
          publishedAt,
          views: parseInt(cols[idx.views] ?? "0") || 0,
          reach: parseInt(cols[idx.reach] ?? "0") || 0,
          likes: parseInt(cols[idx.likes] ?? "0") || 0,
          comments: parseInt(cols[idx.comments] ?? "0") || 0,
          saves: parseInt(cols[idx.saves] ?? "0") || 0,
          shares: parseInt(cols[idx.shares] ?? "0") || 0,
          follows: parseInt(cols[idx.follows] ?? "0") || 0,
          duration: parseInt(idx.duration >= 0 ? cols[idx.duration] ?? "0" : "0") || 0,
        });
      }

      if (postRows.length > 0) {
        await prisma.postInsight.deleteMany({ where: { reportId } });
        await prisma.postInsight.createMany({
          data: postRows.map((p) => ({ ...p, reportId })),
        });
        results.posts = postRows.length;
      }
    } else if (csvType === "daily") {
      // Parse daily metrics CSV
      // Expected: Date/Tanggal column + Primary/value column
      const dailyRows: DailyRow[] = [];

      // Determine metric type from filename or first header
      const metricType = file.name.toLowerCase();
      let metricKey: keyof Omit<DailyRow, "date"> = "views";
      if (metricType.includes("reach")) metricKey = "reach";
      else if (metricType.includes("interaction") || metricType.includes("interaksi")) metricKey = "interactions";
      else if (metricType.includes("follow")) metricKey = "follows";
      else if (metricType.includes("visit") || metricType.includes("profile")) metricKey = "profileVisits";
      else if (metricType.includes("link") || metricType.includes("click")) metricKey = "linkClicks";
      else if (metricType.includes("tayangan") || metricType.includes("view")) metricKey = "views";

      const dateIdx = headers.findIndex((h) =>
        h.toLowerCase().includes("date") || h.toLowerCase().includes("tanggal")
      );
      const valueIdx = headers.findIndex((h) =>
        h.toLowerCase().includes("primary") || h.toLowerCase() === "value"
      );

      if (dateIdx >= 0 && valueIdx >= 0) {
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 2) continue;
          const dateStr = cols[dateIdx];
          const value = parseInt(cols[valueIdx]) || 0;
          if (!dateStr) continue;
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) continue;

          dailyRows.push({
            date: d,
            views: 0,
            reach: 0,
            interactions: 0,
            follows: 0,
            profileVisits: 0,
            linkClicks: 0,
            [metricKey]: value,
          });
        }
      }

      // Upsert daily metrics
      for (const row of dailyRows) {
        await prisma.dailyMetric.upsert({
          where: { reportId_date: { reportId, date: row.date } },
          create: { ...row, reportId },
          update: { [metricKey]: row[metricKey] },
        });
      }
      results.daily += dailyRows.length;
    } else {
      results.errors.push(`File "${file.name}" tidak dikenali formatnya`);
    }
  }

  return NextResponse.json({ success: true, ...results });
}