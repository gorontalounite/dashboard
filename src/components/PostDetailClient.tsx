"use client";
import { useRef } from "react";
import Link from "next/link";

interface Props {
  postId: string;
  fileName: string;
  printRef: React.RefObject<HTMLDivElement>;
}

export function PostDetailActions({ postId, fileName, printRef }: Props) {
  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, {
      scale: 2,
      backgroundColor: "#0a0a0f",
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let position = 0;
    const pageHeight = pdf.internal.pageSize.getHeight();
    while (position < pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
      position += pageHeight;
      if (position < pdfHeight) pdf.addPage();
    }
    pdf.save(fileName + ".pdf");
  }

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
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-xl transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export PDF
      </button>
    </div>
  );
}

export function usePostDetailRef() {
  return useRef<HTMLDivElement>(null);
}
