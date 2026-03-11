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

function decodeFile(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer);
  if (
    (uint8[0] === 0xff && uint8[1] === 0xfe) ||
    (uint8[0] === 0xfe && uint8[1] === 0xff)
  ) {
    return new TextDecoder("utf-16").decode(buffer);
  }
  return new TextDecoder("utf-8").decode(buffer).replace(/^\uFEFF/, "");
}

function getLines(text: string): string[] {
  const all = text.split("\n").map((l) => l.trim()).filter((l) => l);
  if (all[0]?.toLowerCase() === "sep=,") return all.slice(1);
  return all;
}

type CSVType = "posts" | "daily" | "audience" | "unknown";

function detectType(lines: string[]): CSVType {
  const first = parseCSVLine(lines[0]).join(",").toLowerCase();
  if (first.includes("post id") || first.includes("permalink")) return "posts";
  if (first.includes("age & gender") || first.includes("age &amp; gender")) return "audience";
  if (
    first.includes("tayangan") ||
    first.includes("content interactions") ||
    first.includes("instagram follows") ||
    first.includes("instagram profile visits") ||
    first.includes("instagram link clicks") ||
    first.includes("reach")
  ) return "daily";
  if (lines[1]) {
    const second = parseCSVLine(lines[1]).join(",").toLowerCase();
    if (
      (second.includes("primary") && second.includes("date")) ||
      (second.includes("primary") && second.includes("tanggal"))
    ) return "daily";
  }
  return "unknown";
}

function mapPostType(type: string): "REELS" | "STORIES" | "POSTS" | "VIDEOS" {
  const t = type.toLowerCase();
  if (t.includes("reel")) return "REELS";
  if (t.includes("stor")) return "STORIES";
  if (t.includes("video")) return "VIDEOS";
  return "POSTS";
}

function getMetricKey(filename: string, metricName: string): keyof Omit<DailyRow, "date"> {
  const f = filename.toLowerCase();
  const m = metricName.toLowerCase();
  if (f.includes("reach") || m.includes("reach")) return "reach";
  if (f.includes("interaction") || f.includes("interaksi") || m.includes("interaction")) return "interactions";
  if (f.includes("follow") || m.includes("follow")) return "follows";
  if (f.includes("visit") || f.includes("profile") || m.includes("profile visits")) return "profileVisits";
  if (f.includes("link") || f.includes("click") || m.includes("link click")) return "linkClicks";
  return "views";
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

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const files = formData.getAll("files") as File[];

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const results = { posts: 0, daily: 0, audience: false, errors: [] as string[] };

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const text = decodeFile(buffer);
    const lines = getLines(text);
    if (lines.length < 2) continue;

    const csvType = detectType(lines);

    // ── POSTS ──────────────────────────────────────────────────
    if (csvType === "posts") {
      const headers = parseCSVLine(lines[0]);
      const postRows: PostRow[] = [];

      const idx = {
  postId: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("post id")),
  username: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("account username")),
  description: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("description")),
  duration: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("duration")),
  publishTime: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("publish time")),
  permalink: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("permalink")),
  postType: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase().includes("post type")),
  date: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "date"),
  views: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "views"),
  reach: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "reach"),
  likes: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "likes"),
  shares: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "shares"),
  follows: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "follows"),
  comments: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "comments"),
  saves: headers.findIndex((h) => h.replace(/"/g, "").trim().toLowerCase() === "saves"),
};

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (cols.length < 8) continue;

        const dateVal = idx.date >= 0 ? cols[idx.date] : "";
        if (dateVal.replace(/"/g, "").trim() !== "Lifetime") continue;

        const username = idx.username >= 0 ? cols[idx.username].replace(/"/g, "").trim() : "";
        if (username && username !== "gorontalo.unite") continue;

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
        await prisma.postInsight.createMany({ data: postRows.map((p) => ({ ...p, reportId })) });
        results.posts = postRows.length;
      }

    // ── DAILY ──────────────────────────────────────────────────
    } else if (csvType === "daily") {
      // Structure: line[0]=metric name, line[1]=Date/Primary header, line[2+]=data
      const metricName = parseCSVLine(lines[0])[0] ?? "";
      const metricKey = getMetricKey(file.name, metricName);

      const dataHeaders = parseCSVLine(lines[1]);
      const dateIdx = dataHeaders.findIndex((h) =>
        h.toLowerCase().includes("date") || h.toLowerCase().includes("tanggal")
      );
      const valueIdx = dataHeaders.findIndex((h) =>
        h.toLowerCase().includes("primary") || h.toLowerCase() === "value"
      );

      if (dateIdx < 0 || valueIdx < 0) {
        results.errors.push(`File "${file.name}": kolom Date/Primary tidak ditemukan`);
        continue;
      }

      const dailyRows: DailyRow[] = [];
      for (let i = 2; i < lines.length; i++) {
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

      for (const row of dailyRows) {
        await prisma.dailyMetric.upsert({
          where: { reportId_date: { reportId, date: row.date } },
          create: { ...row, reportId },
          update: { [metricKey]: row[metricKey] },
        });
      }
      results.daily += dailyRows.length;

    // ── AUDIENCE ───────────────────────────────────────────────
    } else if (csvType === "audience") {
      // Structure:
      // "Age & gender"
      // "",Women,Men
      // 18-24,9.9,8.6
      // ...
      // "Top cities"
      // city1,city2,...
      // pct1,pct2,...

      let section = "";
      const ageData: Record<string, { women: number; men: number }> = {};
      const cityNames: string[] = [];
      const cityPcts: number[] = [];

      for (let i = 0; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        const rowLabel = cols[0]?.toLowerCase() ?? "";

        if (rowLabel.includes("age & gender") || rowLabel.includes("age &amp; gender")) {
          section = "age";
          continue;
        }
        if (rowLabel.includes("top cities")) {
          section = "cities";
          continue;
        }
        if (rowLabel.includes("top countries")) {
          section = "countries";
          continue;
        }

        if (section === "age") {
          if (rowLabel === "" || rowLabel.includes("women")) continue; // skip header row
          const ageLabel = cols[0];
          const women = parseFloat(cols[1] ?? "0") || 0;
          const men = parseFloat(cols[2] ?? "0") || 0;
          if (ageLabel) ageData[ageLabel] = { women, men };
        }

        if (section === "cities") {
          if (cityNames.length === 0) {
            // First row = city names
            cols.forEach((c) => { if (c) cityNames.push(c); });
          } else if (cityPcts.length === 0) {
            // Second row = percentages
            cols.forEach((c) => { cityPcts.push(parseFloat(c) || 0); });
          }
        }
      }

      // Calculate total women/men from age data
      let totalWomen = 0;
      let totalMen = 0;
      Object.values(ageData).forEach(({ women, men }) => {
        totalWomen += women;
        totalMen += men;
      });

      const audiencePayload = {
        genderWomen: totalWomen,
        genderMen: totalMen,
        age18to24: (ageData["18-24"]?.women ?? 0) + (ageData["18-24"]?.men ?? 0),
        age25to34: (ageData["25-34"]?.women ?? 0) + (ageData["25-34"]?.men ?? 0),
        age35to44: (ageData["35-44"]?.women ?? 0) + (ageData["35-44"]?.men ?? 0),
        age45to54: (ageData["45-54"]?.women ?? 0) + (ageData["45-54"]?.men ?? 0),
        age55to64: (ageData["55-64"]?.women ?? 0) + (ageData["55-64"]?.men ?? 0),
        age65plus: (ageData["65+"]?.women ?? 0) + (ageData["65+"]?.men ?? 0),
        age13to17: 0,
        topCity1: cityNames[0] ?? null,
        topCity1Pct: cityPcts[0] ?? 0,
        topCity2: cityNames[1] ?? null,
        topCity2Pct: cityPcts[1] ?? 0,
        topCity3: cityNames[2] ?? null,
        topCity3Pct: cityPcts[2] ?? 0,
        topCity4: cityNames[3] ?? null,
        topCity4Pct: cityPcts[3] ?? 0,
        topCity5: cityNames[4] ?? null,
        topCity5Pct: cityPcts[4] ?? 0,
      };

      await prisma.audienceData.upsert({
        where: { reportId },
        create: { ...audiencePayload, reportId },
        update: audiencePayload,
      });

      results.audience = true;

    } else {
      results.errors.push(`File "${file.name}" tidak dikenali formatnya`);
    }
  }

  return NextResponse.json({ success: true, ...results });
}