"use client";

interface EscrowStatusBannerProps {
  balance: number;
  totalAmount: number;
  status: string;
}

export function EscrowStatusBanner({
  balance,
  totalAmount,
  status,
}: EscrowStatusBannerProps) {
  if (status === "inDispute") {
    return (
      <div className="border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs font-nothing tracking-widest text-red-700 uppercase">
          Dispute in Progress
        </span>
      </div>
    );
  }

  if (status === "released") {
    return (
      <div className="border border-green-200 bg-green-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs font-nothing tracking-widest text-green-700 uppercase">
          Complete
        </span>
      </div>
    );
  }

  if (balance === 0) {
    return (
      <div className="border border-red-200 bg-red-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <div>
          <span className="text-xs font-nothing tracking-widest text-red-700 uppercase">
            Awaiting Funding
          </span>
          <p className="text-[10px] text-red-600 mt-0.5">
            Send {totalAmount} USDC to the escrow contract to activate.
          </p>
        </div>
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-xs font-nothing tracking-widest text-blue-700 uppercase">
          Active — Payments in Progress
        </span>
      </div>
    );
  }

  if (balance > 0 && balance < totalAmount) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-xs font-nothing tracking-widest text-amber-700 uppercase">
          Partially Funded
        </span>
      </div>
    );
  }

  if (balance >= totalAmount && totalAmount > 0) {
    return (
      <div className="border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-xs font-nothing tracking-widest text-amber-700 uppercase">
          Funded — Work in Progress
        </span>
      </div>
    );
  }

  return (
    <div className="border border-red-200 bg-red-50 p-4 flex items-center gap-3">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <div>
        <span className="text-xs font-nothing tracking-widest text-red-700 uppercase">
          Awaiting Funding
        </span>
        <p className="text-[10px] text-red-600 mt-0.5">
          Send {totalAmount} USDC to the escrow contract to activate.
        </p>
      </div>
    </div>
  );
}
