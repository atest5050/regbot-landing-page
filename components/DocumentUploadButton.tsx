"use client";

// DocumentUploadButton — drag-and-drop + click-to-upload trigger.
//
// Two variants:
//   "compact" — small icon button for the chat input bar
//   "full"    — larger card-style zone for the checklist sidebar
//
// Upload flow:
//   1. User selects or drops a file
//   2. Component shows progress while POSTing to /api/document/analyze
//   3. On success, calls onAnalysisComplete with the parsed result
//   4. On error, shows an inline error message

import { useRef, useState, useCallback } from "react";
import { Upload, Paperclip, X, FileText, Image, Loader2, AlertCircle } from "lucide-react";
import type { DocumentAnalysis } from "@/lib/regbot-types";
import type { ChecklistItem } from "@/lib/checklist";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  analysis: DocumentAnalysis;
  storagePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface Props {
  /** Active business ID — used for Storage scoping */
  businessId?: string;
  businessName?: string;
  location?: string;
  checklist?: ChecklistItem[];
  onAnalysisComplete: (result: AnalysisResult) => void;
  /** "compact" shows a small icon button; "full" shows a drop-zone card */
  variant?: "compact" | "full";
  disabled?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACCEPTED = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/tiff"];
const ACCEPTED_EXT = ".pdf,.jpg,.jpeg,.png,.gif,.webp,.tiff";
const MAX_MB = 20;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
  return <Image className="h-4 w-4 text-blue-500" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentUploadButton({
  businessId,
  businessName = "My Business",
  location = "",
  checklist = [],
  onAnalysisComplete,
  variant = "compact",
  disabled = false,
}: Props) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);  // 0–100 simulated
  const [error,     setError]     = useState<string | null>(null);
  const [fileName,  setFileName]  = useState<string | null>(null);

  // Validate before upload
  const validate = (file: File): string | null => {
    if (!ACCEPTED.includes(file.type)) {
      return `Unsupported file type (${file.type}). Please upload a PDF, JPG, PNG, or WebP.`;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return `File too large (${formatBytes(file.size)}). Max ${MAX_MB} MB.`;
    }
    return null;
  };

  const upload = useCallback(async (file: File) => {
    const validationError = validate(file);
    if (validationError) { setError(validationError); return; }

    setError(null);
    setUploading(true);
    setFileName(file.name);
    setProgress(10);

    // Simulate progress while the server works
    const ticker = setInterval(() => {
      setProgress(p => Math.min(p + 8, 85));
    }, 700);

    try {
      const body = new FormData();
      body.append("file",         file);
      body.append("businessId",   businessId ?? "");
      body.append("businessName", businessName);
      body.append("location",     location);
      body.append("checklist",    JSON.stringify(checklist));

      const res  = await fetch("/api/document/analyze", { method: "POST", body });
      const data = await res.json() as { ok: boolean; error?: string } & Partial<AnalysisResult>;

      clearInterval(ticker);
      setProgress(100);

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Analysis failed");
      }

      setTimeout(() => {
        setUploading(false);
        setFileName(null);
        setProgress(0);
        onAnalysisComplete({
          analysis:    data.analysis!,
          storagePath: data.storagePath ?? "",
          fileName:    data.fileName    ?? file.name,
          mimeType:    data.mimeType    ?? file.type,
          sizeBytes:   data.sizeBytes   ?? file.size,
        });
      }, 300);

    } catch (err) {
      clearInterval(ticker);
      setUploading(false);
      setProgress(0);
      setFileName(null);
      setError((err as Error).message ?? "Upload failed. Please try again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, businessName, location, checklist, onAnalysisComplete]);

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void upload(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  // ── Hidden file input (shared) ─────────────────────────────────────────────

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPTED_EXT}
      onChange={handleFileChange}
      className="hidden"
      aria-hidden="true"
    />
  );

  // ── Compact variant (for chat input bar) ───────────────────────────────────

  if (variant === "compact") {
    return (
      <div className="relative">
        {hiddenInput}
        <button
          type="button"
          onClick={() => { setError(null); inputRef.current?.click(); }}
          disabled={disabled || uploading}
          title="Upload existing permit or license document"
          className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-colors shrink-0 ${
            uploading
              ? "bg-blue-50 border-blue-200 text-blue-500 cursor-not-allowed"
              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          } disabled:opacity-40`}
        >
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Paperclip className="h-4 w-4" />}
        </button>

        {/* Uploading tooltip-style status */}
        {uploading && fileName && (
          <div className="absolute bottom-12 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-20">
            <div className="flex items-center gap-2 mb-1.5">
              {fileIcon(checklist[0]?.formId ? "application/pdf" : "image/jpeg")}
              <p className="text-[11px] font-medium text-slate-700 truncate flex-1">{fileName}</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {progress < 90 ? "Uploading & analyzing…" : "Finishing…"}
            </p>
          </div>
        )}

        {/* Error tooltip */}
        {error && (
          <div className="absolute bottom-12 left-0 w-56 bg-red-50 border border-red-200 rounded-xl shadow-lg p-2.5 z-20 flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-red-700 leading-snug">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-[10px] text-red-500 hover:underline mt-0.5"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Full variant (for checklist sidebar) ───────────────────────────────────

  return (
    <div className="space-y-2">
      {hiddenInput}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => { if (!uploading && !disabled) { setError(null); inputRef.current?.click(); } }}
        className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          disabled || uploading
            ? "opacity-50 cursor-not-allowed border-slate-200 bg-slate-50"
            : dragging
              ? "border-blue-400 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-xs font-medium text-blue-700">
                {progress < 90 ? "Analyzing document…" : "Almost done…"}
              </p>
              {fileName && (
                <p className="text-[10px] text-slate-400 truncate max-w-full">{fileName}</p>
              )}
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Upload className={`h-6 w-6 ${dragging ? "text-blue-500" : "text-slate-400"}`} />
              <div>
                <p className="text-xs font-semibold text-slate-700">
                  {dragging ? "Drop to analyze" : "Upload Document"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  PDF, JPG, PNG · max {MAX_MB} MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-2.5 py-2">
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-700 leading-snug flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center leading-snug">
        Upload existing permits, licenses, or inspection reports.
        RegPulse AI will extract key info and update your checklist automatically.
      </p>
    </div>
  );
}
