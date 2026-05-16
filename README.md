# ClauseKit

The AI that reads contracts, builds escrows, and resolves disputes.

ClauseKit is an AI-first contract engine. It reads any service agreement — a PDF, a wall of legal text, or a two-sentence description in plain English — understands the legal structure, extracts parties, milestones, and payment conditions automatically, and deploys a live escrow on the Stellar blockchain in under sixty seconds. No forms. No manual entry. No sign-ups.

When disputes arise, the AI reads the original contract again — it analyzes the claim against the actual agreement terms and recommends a settlement split based on what the contract says, not what a support agent guesses. A neutral on-chain resolver signs, and funds are distributed automatically.

Built on the **Trustless Work Escrow Protocol** and **Stellar Soroban smart contracts**, ClauseKit eliminates the trust gap between freelancers and clients with AI-powered contract understanding, role-gated on-chain enforcement, and automated dispute resolution.

> **Live at:** https://clausekit-794944941372.us-central1.run.app · **Source:** https://github.com/AryanSaxenaa/ClauseKit

---

## The AI Difference

ClauseKit doesn't just hold money — it understands agreements. Three AI systems power the entire lifecycle:

### 1. AI Contract Extraction
Drop a PDF, paste legal text, or describe a deal in plain English. The AI doesn't keyword-match — it parses legal structure, identifies parties by role, extracts every milestone with dollar amounts, and pulls release conditions from the actual contract language. A 20-page document becomes a structured escrow in seconds. No forms, no data entry, no manual milestone typing.

**Models:** `openrouter/owl-alpha` (primary) → `poolside/laguna-m.1:free` → `baidu/cobuddy:free` (fallbacks)

### 2. AI Dispute Resolution
When either party raises a dispute, the AI re-reads the original contract. It analyzes the claim against the actual agreement terms — not generic rules, not a support agent's guess. It cross-references the dispute reason with the contract clauses and recommends a precise settlement split with reasoning rooted in the contract language. The receiving party sees "Release $X to provider, Return $Y to client" with the legal basis for the decision.

**Models:** `openrouter/owl-alpha` (primary) → `poolside/laguna-m.1:free` → `baidu/cobuddy:free` (fallbacks) → guaranteed 50/50 split if all models unavailable

### 3. AI Deal Description
No contract? Describe the deal in plain English. "I need a website built for $3,000 with three milestones" — the AI infers the parties, creates reasonable milestones, distributes amounts, and builds the escrow structure. No legal document required.

**Models:** `openrouter/owl-alpha` (primary) → `poolside/laguna-m.1:free` → `baidu/cobuddy:free` (fallbacks)

---

## How It Works

1. **Drop or describe** — Upload a PDF, paste a contract, or describe the deal in plain English
2. **AI understands** the contract — legal structure extraction: parties, milestones, amounts, and conditions
3. **Review and edit** — Adjust the AI's extracted milestones and wallet addresses before committing
4. **Deploy on-chain** — Sign a single Stellar transaction; the AI's understanding becomes a Soroban smart contract
5. **Fund the escrow** — Transfer the total contract value in USDC to the contract
6. **Track milestones** — Both parties see live status: Pending → In Review → Approved → Released
7. **Release payments** — Funds transfer atomically when milestones are approved and released
8. **Dispute with AI** — Either party raises a dispute; the AI re-reads the original contract and recommends a settlement; the neutral resolver signs, and funds distribute automatically

## Live Deployment

| Property | Value |
|---|---|
| Production URL | https://clausekit-794944941372.us-central1.run.app |
| Region | us-central1 (Iowa) |
| Platform | Google Cloud Run (serverless) |
| Source | https://github.com/AryanSaxenaa/ClauseKit |

---

## Escrow Lifecycle

### Deploy
The client initiates the escrow with their connected wallet. A multi-release Soroban smart contract is deployed to Stellar testnet with the milestone structure embedded on-chain.

### Fund
After deployment, the client sends the total contract value in USDC to the escrow contract. A status banner tracks the balance in real-time.

### Track & Release
Each milestone progresses through four states:
- **Pending** — Work not yet started
- **In Review** — Marked done by the service provider
- **Approved** — Accepted by the client
- **Released** — Funds transferred to the service provider

Actions are role-gated — only the authorized wallet can advance the milestone state.

### Dispute

Either party can raise a dispute for any non-released milestone from the escrow dashboard. The flow is fully on-chain and AI-assisted:

1. **Raise** — Enter the dispute reason and sign the transaction. The milestone moves to an on-chain disputed state.
2. **AI Analysis** — The system sends the original contract text, the dispute reason, and the milestone details to the AI (owl-alpha, with laguna-m.1 and cobuddy fallbacks). A recommended settlement split is returned within seconds. If all AI models are unavailable, a guaranteed 50/50 fallback ensures amounts are always displayed.
3. **Resolver Review** — The dispute resolver connects their wallet and sees a dedicated dashboard listing all pending disputes. Clicking any milestone auto-scrolls to the DisputePanel, which auto-detects the on-chain disputed state and fetches the AI recommendation immediately — no need to re-enter the reason.
4. **Resolve** — The dispute resolver signs the on-chain settlement transaction. Funds for that milestone are distributed: the client portion returns to the approver, and the remainder is released to the service provider.

The dispute resolver is a neutral third-party address configured at deployment time (typically the platform address). Role-gating ensures neither the contractor nor the freelancer can unilaterally resolve a dispute.

## Architecture

```
clausekit/
├── app/
│   ├── page.tsx                          # Landing page
│   ├── layout.tsx                        # Root layout with providers
│   ├── error.tsx                         # Error boundary
│   ├── not-found.tsx                     # 404 page
│   ├── deploy/
│   │   └── page.tsx                      # Review and deploy page
│   ├── escrow/
│   │   └── [contractId]/
│   │       └── page.tsx                  # Escrow management page
│   └── api/
│       ├── extract/route.ts              # AI contract extraction
│       ├── resolve-dispute/route.ts      # AI dispute resolution
│       └── health/route.ts               # Health check
├── components/
│   ├── contract-upload.tsx               # File upload and text paste
│   ├── deal-describe-input.tsx           # Natural language input
│   ├── milestone-preview.tsx             # Milestone editor
│   ├── milestone-card.tsx                # Per-milestone actions
│   ├── escrow-deploy.tsx                 # Deploy transaction flow
│   ├── escrow-status-banner.tsx          # Status display
│   ├── fund-escrow.tsx                   # Fund transaction flow
│   ├── wallet-connect.tsx                # Wallet connection UI
│   └── dispute-panel.tsx                 # Dispute resolution flow
├── lib/
│   ├── ai.ts                             # AI prompt templates and extraction
│   ├── escrow-builder.ts                # Payload construction
│   └── pdf-parser.ts                     # Client-side PDF extraction
├── providers/
│   ├── wallet-provider.tsx               # Stellar Wallets Kit context
│   ├── trustless-work-provider.tsx       # Trustless Work SDK config
│   └── query-provider.tsx                # React Query provider
├── types/
│   └── contract.ts                       # TypeScript type definitions
├── public/
│   ├── logo.png                          # Application logo and favicon
│   ├── hero-illustration.png             # Hero section illustration
│   └── pdf.worker.min.mjs                # PDF.js worker
├── Dockerfile                            # Multi-stage production build
├── cloudbuild.yaml                       # Google Cloud Build configuration
└── next.config.ts                        # Next.js configuration
```

## Setup

### Prerequisites

- Node.js 22 or later
- A Stellar testnet wallet (Freighter browser extension recommended)
- An OpenRouter API key (free tier is sufficient for testing)
- A Trustless Work testnet API key (available at https://dapp.trustlesswork.com > Settings > API Keys > Testnet)

### Environment Variables

Create a `.env.local` file in the project root with the following keys:

```
NEXT_PUBLIC_TW_API_KEY=your_trustless_work_testnet_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_PLATFORM_ADDRESS=your_stellar_testnet_platform_address
```

### Local Development

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000.

## Deployment

### Google Cloud Run

The project includes a `Dockerfile` with multi-stage builds using Node.js 22 Alpine and a `cloudbuild.yaml` for automated CI/CD via Google Cloud Build.

**Prerequisites for deployment:**

- Google Cloud SDK (`gcloud`) installed and authenticated
- `roles/run.admin` permission on the target project
- `roles/artifactregistry.writer` permission for container registry access
- `roles/storage.objectViewer` permission for Cloud Build source storage

**Deploy via Cloud Build:**

```bash
gcloud builds submit \
  --project clausekit \
  --config cloudbuild.yaml \
  --substitutions _REGION=us-central1,_REPOSITORY=clausekit,_TAG=latest,_TW_API_KEY=your_key,_OPENROUTER_API_KEY=your_key,_PLATFORM_ADDRESS=your_address
```

**Deploy via Docker and Cloud Run:**

```bash
docker build \
  --build-arg NEXT_PUBLIC_TW_API_KEY=your_key \
  --build-arg NEXT_PUBLIC_PLATFORM_ADDRESS=your_address \
  -t us-central1-docker.pkg.dev/clausekit/clausekit/clausekit:latest .

docker push us-central1-docker.pkg.dev/clausekit/clausekit/clausekit:latest

gcloud run deploy clausekit \
  --image us-central1-docker.pkg.dev/clausekit/clausekit/clausekit:latest \
  --region us-central1 \
  --project clausekit \
  --allow-unauthenticated \
  --set-env-vars OPENROUTER_API_KEY=your_openrouter_key
```

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| AI / NLP | OpenRouter (owl-alpha) with laguna-m.1 and cobuddy fallbacks |
| Escrow Protocol | Trustless Work React SDK v3.0.5 (Testnet) |
| Wallet Integration | Stellar Wallets Kit (Freighter, xBull, Albedo) |
| PDF Parsing | pdfjs-dist (client-side extraction) |
| Form Validation | React Hook Form + Zod |
| State Management | React Query (TanStack Query) |
| Containerization | Docker (multi-stage, Node 22 Alpine) |
| Cloud Platform | Google Cloud Run (serverless containers) |
| CI/CD | Google Cloud Build |

## External Links

- **Trustless Work Escrow Viewer:** https://viewer.trustlesswork.com
- **Trustless Work Documentation:** https://docs.trustlesswork.com
- **Stellar Testnet Explorer:** https://stellar.expert/explorer/testnet
- **OpenRouter API:** https://openrouter.ai
- **Freighter Wallet:** https://freighter.app
- **Trustless Work DApp:** https://dapp.trustlesswork.com
