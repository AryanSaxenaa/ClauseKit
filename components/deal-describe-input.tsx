"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";

const describeSchema = z.object({
  text: z.string().min(20, "Describe your deal in at least 20 characters"),
});

type DescribeForm = z.infer<typeof describeSchema>;

interface DealDescribeInputProps {
  onTextReady: (text: string) => void;
  isLoading: boolean;
}

export function DealDescribeInput({
  onTextReady,
  isLoading,
}: DealDescribeInputProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DescribeForm>({
    resolver: zodResolver(describeSchema),
  });

  const onSubmit = (data: DescribeForm) => {
    onTextReady(data.text);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-2xl">
      <Textarea
        {...register("text")}
        placeholder='e.g. Logo design project for Acme Corp. 3 milestones: brand brief review ($150), logo draft ($300), final files ($200). Designer is paid after each client approval.'
        rows={14}
        className="bg-white border-black/10 text-black placeholder:text-black/20 text-sm focus:border-red-400 focus:ring-red-400/20 resize-y"
      />
      {errors.text && (
        <p className="text-xs text-red-600">{errors.text.message}</p>
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
  );
}
