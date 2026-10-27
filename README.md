# Unified Custom CRM & Headless Content Engine
### AIREC Enterprise & MetaMindful

This repository contains the standalone, separately deployed **Custom CRM & Content Platform** engineered for **AIREC** (B2B AI Research & Consulting) and **MetaMindful** (Mental Wellness App).

---

## 1. System Overview

- **Architecture:** Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Database:** Google Cloud Firestore (Multi-tenant NoSQL collections)
- **Authentication:** Firebase Auth (Role-Based Access Control)
- **Media Storage:** Firebase Storage (Global CDN for images and diagrams)
- **Realtime Sync:** Firestore `onSnapshot` event stream for real-time compliance & lead alerts
- **Isolation:** Completely separated from public client sites (`airec` and `metamindful`)

---

## 2. Managed Brand Modules

### MetaMindful Ops
1. **Blogs & Media Hub:**
   - 21 full SEO articles with structured section blocks.
   - Author profiles, reading times, category tags.
   - Media asset management with explicit aspect ratios (`1536x1024`) preventing CLS.
   - Point-in-time revision commit history (`v1.0`, `v1.1`, etc.).
   - **Community Social Suite:** Atomic Likes counter, Share tracking, and **Admin Comment Moderation Desk** (comments require approval before appearing on the public blog).
2. **GDPR Account Deletion Compliance Desk:**
   - Real-time stream listening to deletion submissions on `https://metamindful.ai/delete-account`.
   - Automated 30-day compliance retention clock.
   - Audit action logs (`Verify Identity`, `Mark Scrubbed`, `Cancel`).
3. **Legal Controller:**
   - Privacy Policy with semantic version tagging (`Version 2`) and effective date tracking.
   - Terms and Conditions with emergency notice callout boxes.
4. **FAQs:**
   - Centralized homepage FAQ manager with drag-and-drop sort order.

### AIREC Enterprise Ops
1. **Services & Deliverables Catalog:**
   - 6 Core Enterprise Offerings (`ai-strategy-consulting`, `custom-ai-development`, `ai-agents-automation`, `generative-ai-llm-solutions`, `ai-research-prototyping`, `predictive-analytics`).
   - Detailed SOW capabilities, deliverable matrices, and tagline badges.
   - Dedicated SEO meta titles, descriptions, and keyword arrays.
2. **Products Showcase:**
   - Profiles for incubated products (MetaMindful spotlight, moments, boundaries, and 4-step methodology).
3. **Multi-Page FAQs & Capability Vectors:**
   - 18 Service-specific technical FAQs (3 per service).
   - 4 Strategic Research & Capability Vector questions (`APPLIED AI / SYSTEMS`, `AGENTS / AUTOMATION`, etc.).
4. **Corporate Legal Hub:**
   - Versioned Corporate Privacy Policy & Terms of Use.
5. **Inbound Leads & Deals Pipeline:**
   - Kanban stages: `NEW` → `CONTACTED` → `QUALIFIED` → `PROPOSAL` → `WON` → `LOST`.
   - Automatic attribution tagging (binds incoming leads to the specific service page viewed, capturing `utm_source`, `utm_campaign`, and `gclid`).

---

## 3. Headless API Specifications

Both websites communicate with this CRM via secure REST endpoints:

### Read Content Endpoints
- `GET /api/v1/content/blogs` — Returns all published MetaMindful blog posts.
- `GET /api/v1/content/services` — Returns all 6 AIREC enterprise services.
- `GET /api/v1/content/faqs?brand=airec` — Returns AIREC multi-page FAQs.
- `GET /api/v1/content/faqs?brand=metamindful` — Returns MetaMindful FAQs.
- `GET /api/v1/content/legal?brand=metamindful&type=PRIVACY_POLICY` — Returns active Privacy Policy.
- `GET /api/v1/metrics` — Returns real-time dashboard aggregated counts.

### Write / Ingestion Endpoints
- `POST /api/v1/leads/inquiry` — Ingests contact inquiries with bot honeypot validation.
- `POST /api/v1/compliance/delete-account` — Registers account deletion request with 30-day grace timer.
- `POST /api/v1/interactions/comments` — Submits a user comment into the CRM moderation queue.
- `POST /api/v1/interactions/likes` — Atomically increments like counter on blog posts.

---

## 4. Quick Start & Local Development

```bash
# 1. Enter CRM directory
cd crm

# 2. Install dependencies (already installed)
npm install

# 3. Re-run automated seeder anytime (extracts fresh data from airec & metamindful)
node scripts/export-initial-data.mjs

# 4. Start local development server
npm run dev -- -p 3005
```

Open [http://localhost:3005](http://localhost:3005) to access the CRM Dashboard.

---

## 5. Deployment Options

- **Option A (Vercel):** Connect `crm` repository root. Set environment variables from `.env.example`.
- **Option B (Firebase App Hosting):** `firebase apphosting:backends:create`.
- **Option C (Docker / Google Cloud Run):** Production containerized deployment.
