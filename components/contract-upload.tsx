"use client";

import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ChevronRight } from "lucide-react";

const pasteSchema = z.object({
  text: z.string().min(50, "Contract must be at least 50 characters"),
});

type PasteForm = z.infer<typeof pasteSchema>;

interface ContractUploadProps {
  onTextReady: (text: string, fileName: string) => void;
  isLoading: boolean;
}

export function ContractUpload({
  onTextReady,
  isLoading,
}: ContractUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasteForm>({
    resolver: zodResolver(pasteSchema),
  });

  const handleFile = useCallback(
    async (file: File) => {
      try {
        let text: string;
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const { extractTextFromPDF } = await import("@/lib/pdf-parser");
          text = await extractTextFromPDF(file);
        } else {
          text = await file.text();
        }
        if (!text.trim()) throw new Error("No text found");
        onTextReady(text.slice(0, 50000), file.name);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Could not read file";
        alert(`${message}. Try pasting the text directly.`);
      }
    },
    [onTextReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onPasteSubmit = (data: PasteForm) => {
    onTextReady(data.text.slice(0, 50000), "pasted-contract.txt");
  };

  return (
    <div className="w-full max-w-2xl">
      {/* Mode switcher */}
      <div className="flex border border-black/10 overflow-hidden w-fit mb-8">
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 text-xs tracking-wide transition-colors ${
            mode === "upload"
              ? "bg-black text-white font-nothing"
              : "text-black/40 hover:text-black"
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode("paste")}
          className={`px-4 py-2 text-xs tracking-wide transition-colors ${
            mode === "paste"
              ? "bg-black text-white font-nothing"
              : "text-black/40 hover:text-black"
          }`}
        >
          Paste Text
        </button>
      </div>

      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed cursor-pointer transition-all duration-200 p-16 text-center group ${
            isDragging
              ? "border-red-400 bg-red-50/50"
              : "border-black/10 hover:border-red-300 bg-transparent"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
            className="hidden"
          />

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-black/10 group-hover:border-red-300 transition-colors" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-black/10 group-hover:border-red-300 transition-colors" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-black/10 group-hover:border-red-300 transition-colors" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-black/10 group-hover:border-red-300 transition-colors" />

          <Upload className="w-8 h-8 text-black/20 mx-auto mb-4 group-hover:text-red-500 transition-colors" />
          <p className="text-sm text-black/40 tracking-wide group-hover:text-black/70 transition-colors">
            Drop a service contract here
          </p>
          <p className="text-xs text-black/20 mt-2 font-nothing tracking-widest">
            PDF · TXT · MD
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onPasteSubmit)} className="space-y-4">
          <Textarea
            {...register("text")}
            placeholder="Paste your service contract text here..."
            rows={14}
            className="bg-white border-black/10 text-black placeholder:text-black/20 text-sm focus:border-red-400 focus:ring-red-400/20 resize-y"
          />
          {errors.text && (
            <p className="text-xs text-red-600">
              {errors.text.message}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="group inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Extracting..." : "Extract Milestones"}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
      )}
    </div>
  );
}
