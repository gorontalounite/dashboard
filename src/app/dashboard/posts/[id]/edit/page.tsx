import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostEditForm } from "@/components/PostEditForm";
import Link from "next/link";
import type { ContentType } from "@/types";

export default async function PostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.postInsight.findUnique({
    where: { id },
    include: { report: true },
  });

  if (!post) notFound();

  const serialized = {
    ...post,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    type: post.type as ContentType,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={"/dashboard/posts/" + id}
        className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Detail Post
      </Link>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white">Edit Post Insight</h1>
        <p className="text-white/40 text-sm mt-1">{post.type} · {post.caption?.slice(0, 60) ?? "no caption"}</p>
      </div>
      <PostEditForm post={serialized} />
    </div>
  );
}
