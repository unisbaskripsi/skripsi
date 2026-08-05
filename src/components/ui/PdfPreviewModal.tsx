"use client";

import React, { useState } from "react";
import { X, Download, ExternalLink, FileText, Loader2 } from "lucide-react";

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  driveLink: string | null;
  title: string;
}

function extractDriveFileId(link: string): string | null {
  // Match /file/d/{id}/ pattern
  const match = link.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Match id={id} query param
  const urlParams = new URLSearchParams(link.split("?")[1] || "");
  return urlParams.get("id");
}

export default function PdfPreviewModal({ isOpen, onClose, driveLink, title }: PdfPreviewModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!isOpen || !driveLink) return null;

  const fileId = extractDriveFileId(driveLink);
  const previewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : driveLink;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex flex-col w-full h-full max-w-5xl mx-auto my-4 md:my-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Preview PDF</p>
              <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <a
              href={driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Buka di Drive</span>
            </a>
            <a
              href={fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* iFrame Body */}
        <div className="relative flex-1 bg-slate-100">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-medium">Memuat dokumen...</p>
            </div>
          )}
          <iframe
            src={previewUrl}
            className="w-full h-full border-0"
            allow="autoplay"
            onLoad={() => setIframeLoaded(true)}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
