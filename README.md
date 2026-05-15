# ClauseKit

AI-powered escrow deployment on Stellar. Upload a service contract and the system extracts milestones, payment amounts, and party information, then deploys a multi-release escrow on the Stellar testnet via the Trustless Work React SDK.

## Overview

ClauseKit reads plain-text or PDF service contracts using AI, extracts the escrow structure, and provides a review interface before deploying on-chain. The entire workflow takes under 60 seconds.

## Workflow

1. Drop a freelance contract PDF or paste the text into the upload zone
2. AI extracts the escrow structure including parties, milestones, and USDC amounts
3. Review and edit the milestone table as needed
4. Connect a Stellar wallet (Freighter, xBull, or Albedo on Testnet)
5. Deploy the escrow by signing the transaction
6. View the live on-chain escrow via the viewer

## Setup

### Prerequisites

- Node.js 20 or later
- A Stellar testnet wallet (Freighter recommended)
- An OpenRouter API key (free tier is sufficient)
- A Trustless Work testnet API key

### Environment Variables

Copy the `.env.local` file and configure the following keys:

```
NEXT_PUBLIC_TW_API_KEY=your_tw_testnet_api_key
OPENROUTER_API_KEY=your_openrouter_key
DEEPSEEK_API_KEY=your_deepseek_key
NEXT_PUBLIC_PLATFORM_ADDRESS=your_stellar_testnet_address
```

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Production Deployment (Google Cloud Run)

```bash
gcloud run deploy clausekit \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 2 \
  --set-env-vars NEXT_PUBLIC_TW_API_KEY=xxx \
  --set-env-vars OPENROUTER_API_KEY=xxx \
  --set-env-vars DEEPSEEK_API_KEY=xxx \
  --set-env-vars NEXT_PUBLIC_PLATFORM_ADDRESS=xxx
```

## Tech Stack

- Frontend: Next.js 16 (App Router), TypeScript, TailwindCSS
- AI: OpenRouter (owl-alpha), DeepSeek fallback
- Escrow: Trustless Work React SDK (testnet)
- Wallet: Stellar Wallets Kit (Freighter, xBull, Albedo)
- PDF parsing: pdfjs-dist (client-side)
- Deployment: Google Cloud Run

## Links

- Trustless Work Escrow Viewer: https://viewer.trustlesswork.com
- Trustless Work Documentation: https://docs.trustlesswork.com
- Stellar Testnet Explorer: https://stellar.expert/explorer/testnet
