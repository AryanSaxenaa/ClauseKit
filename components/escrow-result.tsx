"use client";

interface EscrowResultProps {
  contractId: string;
}

export function EscrowResult({ contractId }: EscrowResultProps) {
  const viewerUrl = `https://viewer.trustlesswork.com/?id=${contractId}`;
  const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${contractId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractId);
  };

  return (
    <div className="w-full max-w-lg mx-auto border border-green-200 bg-green-50 p-6 text-center space-y-4">
      <div className="text-3xl">✅</div>
      <h3 className="text-sm font-nothing tracking-widest text-green-700 uppercase">
        Escrow Deployed
      </h3>
      <div className="flex items-center justify-center gap-2">
        <code className="text-[11px] bg-green-100 px-3 py-1.5 break-all text-green-800 font-mono">
          {contractId}
        </code>
        <button
          onClick={copyToClipboard}
          className="text-[11px] text-green-600 hover:underline"
        >
          Copy
        </button>
      </div>
      <div className="flex gap-3 justify-center">
        <a
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-red-600 text-white h-8 px-3 gap-1.5 text-xs font-nothing tracking-wide hover:bg-red-700 transition-colors"
        >
          View Escrow
        </a>
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center border border-black/10 text-black/60 h-8 px-3 gap-1.5 text-xs hover:text-red-600 hover:border-red-300 transition-all"
        >
          Stellar Explorer
        </a>
      </div>
    </div>
  );
}
