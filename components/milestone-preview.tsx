"use client";

import type { EditableMilestone, ExtractedContract } from "@/types/contract";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MilestonePreviewProps {
  extracted: ExtractedContract;
  milestones: EditableMilestone[];
  onChangeMilestone: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  serviceProviderWallet: string;
  onChangeServiceProviderWallet: (wallet: string) => void;
  walletError?: string;
}

export function MilestonePreview({
  extracted,
  milestones,
  onChangeMilestone,
  serviceProviderWallet,
  onChangeServiceProviderWallet,
  walletError,
}: MilestonePreviewProps) {
  const total = milestones.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Party info card */}
      <div className="border border-black/5 bg-white p-4 grid grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] text-black/30 font-nothing tracking-widest uppercase">
            Client
          </span>
          <p className="text-sm text-black mt-1 font-medium">{extracted.client.name}</p>
          <p className="text-xs text-black/50">{extracted.client.role}</p>
        </div>
        <div>
          <span className="text-[10px] text-black/30 font-nothing tracking-widest uppercase">
            Service Provider
          </span>
          <p className="text-sm text-black mt-1 font-medium">{extracted.serviceProvider.name}</p>
          <p className="text-xs text-black/50">{extracted.serviceProvider.role}</p>
        </div>
      </div>

      {/* Wallet address */}
      <div>
        <label className="block text-xs text-black/50 font-nothing tracking-wide uppercase mb-1">
          Service Provider Stellar Address
        </label>
        <Input
          type="text"
          value={serviceProviderWallet}
          onChange={(e) => onChangeServiceProviderWallet(e.target.value)}
          placeholder="G..."
          className="border-black/10 text-black placeholder:text-black/20 text-sm focus:border-red-400 focus:ring-red-400/20"
        />
        {walletError && (
          <p className="text-xs text-red-600 mt-1">{walletError}</p>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-sm text-black/50 font-nothing tracking-widest mb-3">
          Milestones <span className="ml-1 text-black/30">({milestones.length})</span>
        </h3>
        <div className="space-y-3">
          {milestones.map((m, i) => (
            <div key={m.id} className="border border-black/5 bg-white p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center text-[11px] font-nothing flex-shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) =>
                    onChangeMilestone(i, "title", e.target.value)
                  }
                  className="flex-1 text-sm font-medium bg-transparent border-none outline-none text-black"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-black/30">$</span>
                  <Input
                    type="number"
                    value={m.amount}
                    onChange={(e) =>
                      onChangeMilestone(i, "amount", Number(e.target.value))
                    }
                    className="w-24 text-right text-sm border-black/10 text-black focus:border-red-400 focus:ring-red-400/20"
                  />
                </div>
              </div>
              <Textarea
                value={m.description}
                onChange={(e) =>
                  onChangeMilestone(i, "description", e.target.value)
                }
                rows={2}
                className="text-sm resize-none border-black/10 text-black placeholder:text-black/20 focus:border-red-400 focus:ring-red-400/20"
              />
              <input
                type="text"
                value={m.condition}
                onChange={(e) =>
                  onChangeMilestone(i, "condition", e.target.value)
                }
                placeholder="Condition for approval..."
                className="w-full text-xs text-black/40 bg-transparent border-none outline-none placeholder:text-black/20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="border border-black/5 bg-zinc-50 p-4 flex justify-between items-center">
        <span className="text-xs text-black/40 font-nothing tracking-wide uppercase">
          Total
        </span>
        <span className="text-base font-nothing text-black">
          ${total.toLocaleString()} USDC
        </span>
      </div>
    </div>
  );
}
