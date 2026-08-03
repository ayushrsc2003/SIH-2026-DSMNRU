# Smart India Hackathon 2026 — Internal Round Portal
### Institute of Engineering & Technology (IET), Dr. Shakuntala Misra National Rehabilitation University (DSMNRU), Lucknow

A full-stack, production-ready web application and team registration system for the internal college screening round of **Smart India Hackathon (SIH) 2026**.

---

## 🌟 Features & Highlights

- **Single Marketing & Registration Flow**:
  - **Hero**: Campus branding, team requirements (6 members, min 1 female), mode (On-Campus), UG/PG/PhD eligibility, and SIH Grand Finale nomination reward.
  - **About SIH**: Background on MoE’s Innovation Cell & AICTE initiative and DSMNRU internal hackathon vision.
  - **Why Participate**: Problem statements, faculty mentorship, national cash awards, resume value.
  - **Event Timeline**: Stepped vertical milestone roadmap with connector line.
  - **Rules & Regulations**: 13 mandatory rules categorized into *Team & Eligibility*, *Submission & Building*, and *Judging & Conduct*.
  - **Evaluation Criteria**: 5 jury scoring rubrics with weightages (Innovation 25%, Feasibility 25%, Usability 20%, Scalability 15%, Defense 15%).
  - **Hall of Fame**: Honoring past national finalists (**Md. Afnan / Team CodeCRUD** & **Ayush Chaurasiya / Team Emotispeak**).
  - **Registration Form**: Dynamic 6-member form with **Live Client Compliance Checklist** (All 6 filled, ≥1 female, no intra-team duplicate emails).
  - **Public Status Check**: Public modal lookup by email returning team name + team ID without leaking personal member details.
  - **Contact & Organizers**: SPOC Ms. Shalini Raghuvanshi (Asst. Prof, CSE) & Student Coordinator Ayush Chaurasiya.

- **Strict Database-Level Business Rule Enforcement**:
  - **Unique Student Email Constraint**: `Member.email` has a `@unique` constraint across ALL teams in the database schema.
  - **Atomic Transactions**: Registration is processed inside a `prisma.$transaction`. Race conditions (e.g. concurrent submissions with duplicate emails) are caught with an HTTP 409 Conflict returning conflicting details.
  - **Server-Side Validation**: Server validates team size (exactly 6), female count (≥ 1), email formats, and required fields before committing.

- **Admin Panel (`/admin`)**:
  - Password protected via HTTP-only session cookies (`ADMIN_PASSWORD`).
  - Key metrics: Total teams, total students, gender compliance pass rate, domain breakdown.
  - Interactive table with live search (by team name, ID, email) and domain filters.
  - Expandable row details for all 6 members.
  - **Export as CSV**: Server generates formatted CSV file download.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Ink/Navy (`#0A0E17`), Saffron (`#FF7A29`), and Green (`#1FAE7A`) dark theme
- **Fonts**: Space Grotesk (headings), IBM Plex Sans (body), IBM Plex Mono (data/labels) via `next/font/google`
- **Database**: PostgreSQL (Production) / SQLite (Local Dev) via **Prisma ORM**
- **Icons**: Lucide React
- **Deployment**: Vercel (Frontend & Serverless API Routes) + Neon / Supabase (Managed PostgreSQL)

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
cd sih-2026-dsmnru
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (or copy `.env.example`):

```env
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="sih2026admin@dsmnru"
NODE_ENV="development"
```

> **Note for Local SQLite**: To run SQLite locally without a live Postgres server, update `prisma/schema.prisma` datasource provider to `provider = "sqlite"`, then run migrations. For PostgreSQL, keep `provider = "postgresql"` and supply your Postgres connection string in `DATABASE_URL`.

### 3. Setup Database Schema & Seed Data

```bash
# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed 3 dummy teams with full member details
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.
- **Main Portal**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin` (Password: `sih2026admin@dsmnru`)

---

## 🔑 Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string (Neon / Supabase / Railway) | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `ADMIN_PASSWORD` | Access key for `/admin` panel authentication | `sih2026admin@dsmnru` |
| `NODE_ENV` | Application execution environment | `development` / `production` |

---

## 📦 Database Schema Overview (`prisma/schema.prisma`)

```prisma
model Team {
  id          String   @id @default(cuid())
  teamId      String   @unique // Human-readable e.g. SIH26-XXXXX
  teamName    String
  domain      String
  ideaSummary String
  mentorName  String
  mentorDept  String
  createdAt   DateTime @default(now())
  members     Member[]
}

model Member {
  id           String  @id @default(cuid())
  teamId       String
  name         String
  branch       String
  year         String
  universityId String
  gender       String
  email        String  @unique // Database-level unique constraint across ALL teams
  phone        String
  isLeader     Boolean @default(false)
  team         Team    @relation(fields: [teamId], references: [id], onDelete: Cascade)
}
```

---

## 🌐 Production Deployment Guide (Vercel + Neon / Supabase)

### Step 1: Managed PostgreSQL Setup (Neon / Supabase)

1. Create a free account on [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com).
2. Create a new PostgreSQL database project (e.g. `sih-2026-dsmnru`).
3. Copy your pooled PostgreSQL connection string from the dashboard (e.g., `postgresql://owner:pass@ep-xyz.neon.tech/neondb?sslmode=require`).

### Step 2: Push Database Schema & Seed Production DB

From your local terminal, point `DATABASE_URL` to your Neon/Supabase database:

```bash
# Set production DATABASE_URL in environment
export DATABASE_URL="postgresql://owner:pass@ep-xyz.neon.tech/neondb?sslmode=require"

# Push schema to live Postgres
npx prisma db push

# (Optional) Seed initial dummy teams
npm run seed
```

### Step 3: Deploy to Vercel

1. Push your repository to GitHub / GitLab.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your `sih-2026-dsmnru` repository.
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: Your Neon/Supabase PostgreSQL connection string.
   - `ADMIN_PASSWORD`: Your chosen secure admin password.
5. Build Command: `prisma generate && next build` (Pre-configured in `package.json`).
6. Click **Deploy**. Vercel will build and launch your application seamlessly!

---

## 📞 Support & Contacts

- **University SPOC**: Ms. Shalini Raghuvanshi (Assistant Professor, Dept. of CSE, IET DSMNRU)
- **Student Coordinator**: Ayush Chaurasiya (B.Tech CSE 4th Year, Phone: `+91 7838504972`, Email: `achaurasiya_csebtech23_041@dsmnru.ac.in`)
- **Official National Portal**: [sih.gov.in](https://sih.gov.in)
