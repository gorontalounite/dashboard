import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PostDetailWrapper } from "@/components/PostDetailWrapper";
import type { ContentType } from "@/types";

export default async function PostDetailPage({
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

  return <PostDetailWrapper post={serialized} />;
}
