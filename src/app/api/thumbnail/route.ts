import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&maxwidth=320&fields=thumbnail_url`;
    const res = await fetch(oembedUrl);
    const data = await res.json();
    return NextResponse.json({ thumbnail: data.thumbnail_url ?? null });
  } catch {
    return NextResponse.json({ thumbnail: null });
  }
}