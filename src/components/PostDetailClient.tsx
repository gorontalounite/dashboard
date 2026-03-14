"use client";
import Link from "next/link";

interface Props {
  postId: string;
}

export function PostDetailActions({ postId }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={"/dashboard/posts/" + postId + "/edit"}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-xl transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </Link>
    </div>
  );
}
