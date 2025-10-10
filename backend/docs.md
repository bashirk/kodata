

* Lisk gives you a **JavaScript/TypeScript-native blockchain SDK** and sidechain model, which makes building on-chain modules and app-chains straightforward with the same language as your backend/frontend. ([GitHub][1])
* Use cases that fit Lisk well here: **reputation, local DAO governance, attestation/credentialing, and on-chain audits** (where JS-native modules simplify business logic). ([GitHub][2])
* Keep Starknet for tokenized payments (STRK) and proofs that need Cairo/L2 tooling; use Lisk for governance/reputation and optional sidechain app logic — a pragmatic hybrid that plays to each chain’s strengths. (Cross-chain actions handled by a relayer/monitor in the backend.)

# Revised high-level architecture (text diagram)

```
Frontend 
  - Wallet connectors: Xverse (Starknet) + Lisk wallets (web wallet / mobile)
  - Task list, claim, annotate, submit UI

Backend (Node.js, API, TypeScript)
  - Prisma ORM -> Postgres
  - Lisk client service (Lisk SDK / api-client)
  - Starknet service (starknet.js)
  - KoData QC (worker queue: BullMQ / Rabbit)
  - Atomiq payout orchestrator (stub for hackathon)
  - IPFS / MinIO for storage

Lisk Layer
  - ReputationModule (custom module / transaction types)
  - GovernanceModule (voting, dispute staking)
  - Optional app-chain per region (sidechain)

Starknet Layer
  - WorkProof (escrow + payouts)
  - TaskNFT (optional)

Offchain
  - Relayer / Event-listener (watches Starknet and Lisk events, cross-chain actions)
  - KoData QC worker & Merkle batching for bulk approvals
```

# How to use Lisk in the DataDAO flows (concrete)

1. **Onboarding / identity & reputation**

   * When annotator first signs in, create/record a `liskAddress` and issue a small on-chain “intro” attestation or reputation token on Lisk (a simple transaction). This anchors a pseudonymous identity with an onchain reputation score.

2. **Reputation & governance**

   * Implement a `ReputationModule` (Lisk module / custom transaction) that holds reputation deltas and onchain disputes. Use the Lisk SDK to define module logic and to sign/broadcast transactions from your backend or from multisig admin wallets.

3. **Disputes & DAO**

   * Store dispute stakes / votes on Lisk. Use off-chain relayer to move state between Starknet (payments) and Lisk (governance). Example: a challenge on Starknet emits an event → backend relayer posts a dispute transaction to Lisk to open a vote.

4. **Audit & attestation**

   * Store **compact commitments** (resultHash, merkleRoot) on Lisk when the use-case prefers JS-native chains for auditability. Keep heavy data in IPFS/S3 and only commit compact proofs on-chain.

> Practical note: Lisk’s SDK + api-client are JS/TS-first — that matches your stack and reduces friction during implementation. ([GitHub][1])

# Minimal Prisma model updates (add Lisk fields)

Add Lisk fields to your existing Prisma schema for users and submissions:

```prisma
model User {
  id             Int      @id @default(autoincrement())
  starknetAddress String? 
  liskAddress     String?    // new: Lisk address (e.g., base32 format)
  btcAddress      String?
  reputation      Int       @default(0)
  createdAt       DateTime  @default(now())
}

model Submission {
  id           Int      @id @default(autoincrement())
  taskId       Int
  userId       Int
  resultHash   String
  storageUri   String
  liskTxId     String?    // new: Lisk tx id for reputation / attestation
  status       SubmissionStatus @default(PENDING)
  qualityScore Int?
  createdAt    DateTime @default(now())

  @@index([taskId])
  @@index([userId])
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
  CHALLENGED
}
```

# Backend integration points (Node/TS)

* **Lisk client service**: use Lisk SDK / API client to sign & broadcast transactions and to subscribe to events. For node-level calls use the `@liskhq/lisk-api-client` or SDK examples to connect to a Lisk node (HTTP/WS). ([npm][3])
* **Relayer**: service that watches Starknet events (submission approved / PaymentReleased) and posts corresponding transactions to Lisk (e.g., reputation increases, DAO notifications). Also watches Lisk for governance resolutions and triggers Starknet actions when needed.
* **Auth**: unified wallet-signin flow:

  * Request nonce → user signs with Starknet wallet OR Lisk wallet (Web3-style Wallet) → backend verifies signature and issues JWT session. Lisk docs show standard web3 wallet signing flows. ([docs.lisk.com][4])

# Example (conceptual) Node/TS snippet for Lisk interactions

Below is *conceptual* skeleton showing how the backend interacts with a Lisk node via an API client and posts a signed transaction. Use the official Lisk SDK docs/examples for exact API calls (links cited).

```ts
// pseudo-code / conceptual
import { createWSClient } from '@liskhq/lisk-api-client'; // look at official package readme
import { signTransactionWithPrivateKey } from 'lisk-crypto-utils'; // conceptual

const client = await createWSClient('ws://localhost:8080/ws'); // or public node

// Build a simple "reputation" tx payload (module/asset params depend on your Lisk module)
const txPayload = {
  module: 'reputation',
  asset: 'increase',
  params: {
    targetAddress: 'lsk...', delta: 10, reason: 'approved submission #123'
  }
};

// Sign the payload (wallet or backend key)
const signedTx = signTransactionWithPrivateKey(txPayload, process.env.LISK_BACKEND_PRIVKEY);

// Broadcast
await client.post('/transactions', signedTx);

// Save tx id to DB for traceability
await prisma.submission.update({ where: { id: 123 }, data: { liskTxId: signedTx.id }});
```

> I kept the above intentionally high-level (SDK APIs vary across versions). Follow the official Lisk SDK docs and `lisk-sdk-examples` repo for exact code samples and transaction schema. ([GitHub][2])

# Cross-chain patterns (Starknet ⇄ Lisk)

* **Event relay**: backend listens for on-chain events on both chains; matched events trigger corresponding actions. Use idempotent relayer logic and proof-of-finality checks.
* **Off-chain attestation**: KoData QC signs an attestation (oracle signature) the Lisk module can verify (if you embed oracle public keys into Lisk module state) — this lets the chain trust off-chain AI QC decisions without publishing raw data.
* **Atomicity** (hackathon): for MVP, implement *eventual consistency* (approve on Starknet → trigger reputation on Lisk). For production, design bonded relayers / multisig guards.

# Where to put Lisk logic (contract/module choices)

* Keep `WorkProof` on **Starknet** for escrow, payment, and task NFTs.
* Put **reputation, governance, and dispute voting** modules on **Lisk** (module logic written in JS/TS with Lisk SDK).
* Use **Merkle roots / commitments** on either chain depending on desired custody: if your team prefers JS/TS native modules for merkle verification + proofs, Lisk is a good place for that logic.

# Dev tasks (updated / assignable)

**Contracts / Modules**

* [ ] Starknet: `WorkProof` (existing)
* [ ] Lisk: `ReputationModule` (increase/decrease), `GovernanceModule` (propose/vote/resolve), `AttestationModule` (oracle pubkeys)
  **Backend**
* [ ] Lisk client service (connect, sign, broadcast, subscribe)
* [ ] Relayer: Starknet ↔ Lisk event bridge (idempotent, queued)
* [ ] Unified wallet auth (Starknet + Lisk signatures)
* [ ] Prisma schema migration to add `liskAddress`, `liskTxId` (done above)
  **Frontend**
* [ ] Wallet connector UI: add Lisk wallet sign-in button + UI helpers (instructions for Lisk wallet users)
* [ ] Display reputation / governance pages (shadcn/ui components)
  **KoData & QC**
* [ ] Add attestation signing (oracle key) for QC results
  **Infra**
* [ ] Run a Lisk test node (local or testnet) or use hosted test API for hackathon
* [ ] Relayer & queue infra (BullMQ / Redis)

# Hackathon MVP milestones (ordered — no time estimates)

1. Add Lisk client library to backend; spin up a local/test Lisk node or pick a public test RPC. ([npm][3])
2. Implement a minimal `ReputationModule` (Lisk) that accepts a simple `increaseReputation` transaction and emits events.
3. Backend relayer: listen for `SubmissionApproved` on Starknet → call Lisk to increase reputation. Save `liskTxId` in DB.
4. Frontend: add Lisk wallet sign-in option and show reputation on user profile (use shadcn/ui).
5. Polishing: show cross-chain events in demo (approve on Starknet → reputation bump on Lisk).

# Quick risks & mitigations (chain-specific)

* **Bridging complexity**: avoid complex atomic cross-chain transfers in the hackathon. Use relayers + event confirmations.
* **SDK versioning**: Lisk SDK API surfaces do change across releases — pin to a specific SDK version and use the official examples repo. ([GitHub][2])
* **Wallet UX**: Provide clear instructions for Lisk wallet users (importing keys, signing messages) — docs show standard web3-style Wallet flows. ([docs.lisk.com][4])

---

If you want, I can **do one of these next** right now (pick one and I’ll produce it immediately):

1. Repo scaffold: `frontend/` + `backend/` (Nodejs / API + Prisma) + placeholder Lisk client service (TS) and example envs.
2. Concrete Lisk module pseudo-code (module spec + example asset schema + JSON RPC examples) ready to drop into a Lisk SDK project.
3. End-to-end sequence example (HTTP + code snippets) showing: sign-in with Lisk wallet → claim task → submit result → KoData QC attestation → Starknet approve → relayer posts Lisk reputation tx (with code).


[1]: https://github.com/LiskArchive/lisk-sdk?utm_source=chatgpt.com "LiskArchive/lisk-sdk: 🔩 Lisk software development kit"
[2]: https://github.com/LiskArchive/lisk-sdk-examples?utm_source=chatgpt.com "LiskArchive/lisk-sdk-examples"
[3]: https://www.npmjs.com/package/%40liskhq/lisk-api-client?activeTab=dependencies&utm_source=chatgpt.com "liskhq/lisk-api-client"
[4]: https://docs.lisk.com/building-on-lisk/interacting-with-the-blockchain/web3/?utm_source=chatgpt.com "Interacting with the blockchain via web3.js"
