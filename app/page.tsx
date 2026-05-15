"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ContractUpload } from "@/components/contract-upload";
import { DealDescribeInput } from "@/components/deal-describe-input";
import type { ExtractionResult, ExtractedContract } from "@/types/contract";
import { isExtractionError } from "@/types/contract";
import {
  ArrowRight,
  Brain,
  ShieldCheck,
  ExternalLink,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const steps = [
  {
    tag: "01",
    icon: FileText,
    title: "Drop or Describe",
    description:
      "Upload any PDF or paste a plain-text service agreement, or describe the deal in plain English. No complex forms.",
  },
  {
    tag: "02",
    icon: Brain,
    title: "AI Extracts",
    description:
      "The AI reads parties, milestones, payment amounts, and conditions automatically in seconds.",
  },
  {
    tag: "03",
    icon: ShieldCheck,
    title: "Review, Deploy & Fund",
    description:
      "Connect your Stellar wallet, review the extracted structure, deploy on-chain, and fund the escrow in one flow.",
  },
  {
    tag: "04",
    icon: ExternalLink,
    title: "Full Escrow Lifecycle",
    description:
      "Fund the escrow, track milestone status, approve deliverables, and release payments — all on-chain from a single dashboard.",
  },
];

const technologies = [
  { label: "Next.js 16", sub: "App Router + API Routes" },
  { label: "Stellar", sub: "Testnet Smart Contracts" },
  { label: "Trustless Work", sub: "Multi-Release Escrow SDK" },
  { label: "OpenRouter", sub: "AI Contract Extraction" },
  { label: "shadcn/ui", sub: "Component Primitives" },
  { label: "Freighter", sub: "Stellar Wallet Kit" },
];

export default function Home() {
  const router = useRouter();
  const uploadRef = useRef<HTMLDivElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [inputMode, setInputMode] = useState<"contract" | "describe">("contract");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTextReady = async (text: string) => {
    setIsExtracting(true);
    setError(null);
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode: inputMode }),
      });
      const result: ExtractionResult = await response.json();
      if (isExtractionError(result)) {
        setError(result.error);
        return;
      }
      const contract = result as ExtractedContract;
      localStorage.setItem("clausekit-extracted", JSON.stringify(contract));
      localStorage.setItem("clausekit-contract-text", text);
      router.push("/deploy");
    } catch {
      setError("Failed to extract contract. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-white text-black">
      {/* NAV */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-black/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ClauseKit"
              width={32}
              height={32}
              className="w-7 h-7"
            />
            <span className="font-nothing text-sm tracking-wide text-black">
              ClauseKit
            </span>
            <span className="text-[10px] text-black/30 font-nothing tracking-widest ml-1 mt-px">
              v1
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() =>
                uploadRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-xs text-black/50 hover:text-red-600 tracking-wide transition-colors"
            >
              Try It
              <span className="ml-1 text-black/20">↓</span>
            </button>
            <a
              href="https://docs.trustlesswork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-black/40 hover:text-red-600 tracking-wide transition-colors"
            >
              Docs <ArrowUpRight className="inline w-3 h-3 -mt-px" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Decorative geometry */}
        <div className="absolute inset-0 pointer-events-none select-none">

          {/* Grid dots */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #000 0.5px, transparent 0.5px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Diagonal lines */}
          <svg
            className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04]"
            viewBox="0 0 800 800"
          >
            <line x1="800" y1="0" x2="0" y2="800" stroke="black" strokeWidth="0.5" />
            <line x1="600" y1="0" x2="0" y2="600" stroke="black" strokeWidth="0.5" />
            <line x1="400" y1="0" x2="0" y2="400" stroke="black" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-32 relative z-10 w-full">
          <div className="flex items-center justify-between gap-8">
            <div className="max-w-lg">
              <h1 className="!text-[clamp(1.5rem,4vw,2.5rem)] mb-8">
                <TypewriterText
                  lines={[
                    { text: "Drop a service", color: "text-black" },
                    { text: "contract.", color: "text-black" },
                    { text: "AI deploys the escrow.", color: "text-red-600" },
                  ]}
                />
              </h1>

              <p className="text-black/50 text-base md:text-lg leading-relaxed mb-8 animate-[fadeUp_0.6s_ease-out_0.2s] [animation-fill-mode:backwards]">
                ClauseKit reads any freelance contract or deal description with AI, extracts milestones
                and payment amounts, then lets you deploy, fund, track, and release the escrow — all on Stellar.
              </p>

              <div className="flex flex-wrap gap-3 animate-[fadeUp_0.6s_ease-out_0.3s] [animation-fill-mode:backwards]">
                <button
                  onClick={() =>
                    uploadRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="group inline-flex items-center gap-3 bg-red-600 text-white px-6 py-3 text-sm hover:bg-red-700 transition-colors"
                >
                  Try It Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://viewer.trustlesswork.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 border border-black/10 px-6 py-3 text-sm text-black/60 hover:text-red-600 hover:border-red-300 transition-all"
                >
                  Escrow Viewer
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Stats row */}
              <div className="mt-12 grid grid-cols-3 gap-8 max-w-md animate-[fadeUp_0.6s_ease-out_0.4s] [animation-fill-mode:backwards]">
                {[
                  { value: "<60s", label: "Deploy Time" },
                  { value: "$0", label: "Gas per Deploy" },
                  { value: "2M+", label: "Context Window" },
                ].map((stat) => (
                  <div key={stat.label} className="border-l-2 border-red-200 pl-4">
                    <div className="text-xl text-black font-nothing tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-black/40 font-nothing tracking-widest mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div className="hidden lg:block flex-shrink-0 -mr-20">
              <Image
                src="/hero-illustration.png"
                alt="Contract to escrow illustration"
                width={800}
                height={800}
                className="w-[650px] xl:w-[750px] h-auto"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-black/20 animate-[fadeUp_0.6s_ease-out_0.5s] [animation-fill-mode:backwards]">
          <span className="text-[10px] font-nothing tracking-widest text-black/30">
            Scroll
          </span>
          <div className="w-px h-8 bg-red-300 animate-bounce" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-32 md:py-40 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20">
            <span className="text-[11px] text-red-600 font-nothing tracking-widest">
              How It Works
            </span>
            <h2 className="mt-4 !text-[clamp(1.1rem,2.7vw,1.8rem)]">
              <span className="text-black">From contract to on-chain</span>
              <span className="text-black/30"> in four steps.</span>
            </h2>
          </div>

          {/* How it works illustration */}
          <div className="mb-16 flex justify-center">
            <Image
              src="/how-it-works-illustration.png"
              alt="How ClauseKit works"
              width={640}
              height={240}
              className="w-full max-w-2xl h-auto object-contain"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {steps.map((step, i) => (
              <div
                key={step.tag}
                className={`group bg-white p-10 relative overflow-hidden hover:bg-red-50/50 transition-colors duration-300 border border-black/5 ${
                  i > 0 ? "md:border-l-0" : ""
                } ${i > 1 ? "border-t-0" : ""}`}
              >
                <div className="absolute top-6 right-6 text-[100px] text-black/[0.03] leading-none select-none tabular-nums font-nothing">
                  {step.tag}
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] text-black/30 font-nothing tracking-[0.2em] mb-6 block">
                    Step {step.tag}
                  </span>
                  <step.icon className="w-5 h-5 text-red-600 mb-4" />
                  <h3 className="mb-2 text-black group-hover:text-red-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-black/50 leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="relative py-24 border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
            <div>
              <span className="text-[11px] text-red-600 font-nothing tracking-widest">
                Technology
              </span>
              <h2 className="mt-4 text-black">
                Built with
                <br />
                <span className="text-black/30">modern tools.</span>
              </h2>
              <p className="text-sm text-black/40 mt-4 max-w-xs leading-relaxed">
                Zero-cost AI, Stellar blockchain, and production-grade
                infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3">
              {technologies.map((tech) => (
                <div
                  key={tech.label}
                  className="p-6 border border-black/5 hover:bg-red-50/50 transition-colors duration-300 group"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 mb-4 group-hover:bg-red-600 transition-colors" />
                  <h4 className="text-sm text-black mb-1 font-nothing tracking-wide">
                    {tech.label}
                  </h4>
                  <p className="text-xs text-black/40 leading-relaxed">
                    {tech.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRY IT */}
      <section
        ref={uploadRef}
        className="relative py-32 md:py-40 border-t border-black/5"
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <span className="text-[11px] text-red-600 font-nothing tracking-widest">
              Try It
            </span>
            <h2 className="mt-4 text-black">
              Drop or describe your deal
              <br />
              <span className="text-black/30">and let AI build the escrow.</span>
            </h2>
          </div>

          {/* Input mode switcher */}
          <div className="flex border border-black/10 overflow-hidden w-fit mx-auto mb-8">
            <button
              onClick={() => setInputMode("contract")}
              className={`px-4 py-2 text-xs tracking-wide transition-colors ${
                inputMode === "contract"
                  ? "bg-black text-white font-nothing"
                  : "text-black/40 hover:text-black"
              }`}
            >
              Upload Contract
            </button>
            <button
              onClick={() => setInputMode("describe")}
              className={`px-4 py-2 text-xs tracking-wide transition-colors ${
                inputMode === "describe"
                  ? "bg-black text-white font-nothing"
                  : "text-black/40 hover:text-black"
              }`}
            >
              Describe the Deal
            </button>
          </div>

          <div className="flex justify-center">
            {inputMode === "contract" ? (
              <ContractUpload
                onTextReady={handleTextReady}
                isLoading={isExtracting}
              />
            ) : (
              <DealDescribeInput
                onTextReady={handleTextReady}
                isLoading={isExtracting}
              />
            )}
          </div>

          {isExtracting && (
            <div className="mt-8 flex items-center justify-center gap-3 text-black/40 text-sm">
              <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="font-nothing tracking-wide text-xs">
                {inputMode === "describe" ? "analyzing deal..." : "analyzing contract..."}
              </span>
            </div>
          )}

          {error && (
            <div className="mt-8 border border-red-200 bg-red-50 p-4 max-w-2xl mx-auto">
              <p className="text-sm text-red-600 tracking-wide">
                Error: {error}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ClauseKit"
              width={24}
              height={24}
              className="w-5 h-5"
            />
            <span className="text-xs text-black/30 font-nothing tracking-wide">
              ClauseKit
            </span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Docs", url: "https://docs.trustlesswork.com" },
              { label: "Stellar", url: "https://stellar.org" },
              { label: "Viewer", url: "https://viewer.trustlesswork.com" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-black/30 hover:text-red-600 tracking-wide transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Keyframe animations */}
      <style jsx global>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/* ── Typewriter text component ── */
function TypewriterText({ lines }: { lines: { text: string; color: string }[] }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const totalChars = lines.reduce((s, l) => s + l.text.length, 0) + (lines.length - 1) * 2;

    const tick = () => setStep((s) => s + 1);
    const reset = () => setStep(0);

    if (step < totalChars) {
      const t = setTimeout(tick, 30);
      return () => clearTimeout(t);
    } else if (step === totalChars) {
      const t = setTimeout(reset, 10000);
      return () => clearTimeout(t);
    }
  }, [step, lines]);

  let charIdx = 0;
  const rendered = lines.map((line) => {
    const start = charIdx;
    charIdx += line.text.length + 2;
    return {
      ...line,
      visible: step >= start ? line.text.slice(0, Math.max(0, step - start)) : "",
    };
  });
  const done = step >= lines.reduce((s, l) => s + l.text.length + 2, 0) - 2;

  return (
    <>
      {rendered.map((line, i) => (
        <span key={i}>
          <span className={line.color}>{line.visible}</span>
          {i === rendered.length - 1 && (
            <span
              className={`inline-block w-[2px] h-[1.1em] ml-0.5 align-middle ${done ? "animate-pulse" : "opacity-100"}`}
              style={{ backgroundColor: line.color === "text-red-600" ? "#dc2626" : "#000" }}
            >
              &nbsp;
            </span>
          )}
          <br />
        </span>
      ))}
    </>
  );
}
