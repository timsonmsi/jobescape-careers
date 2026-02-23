# JobEscape Careers ATS

A modern Applicant Tracking System (ATS) built with Next.js 14, Prisma, and AI-powered candidate screening.

## Features

### For Candidates
- 📋 Browse open positions with filters
- 📝 Easy application with resume upload
- 🤖 Instant AI feedback on application match
- 📧 Application status tracking

### For Recruiters
- 🎯 Post and manage job listings
- 👥 Candidate CRM with AI scoring
- 📊 Visual recruitment pipeline
- 📅 Interview scheduling
- 📈 Analytics dashboard
- 🤖 AI-powered resume parsing and screening

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **UI:** Tailwind CSS + shadcn/ui components
- **AI:** Anthropic Claude API
- **File Upload:** Local storage (extendable to S3/GCS)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key (optional, for AI features)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Random string for session signing
   - `ANTHROPIC_API_KEY` - Your Anthropic API key (optional)

3. **Set up the database:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   - Careers Portal: http://localhost:3001/careers
   - Recruiter Dashboard: http://localhost:3001/dashboard
   - Demo Login: `admin@jobescape.com` / `admin123`

## Project Structure

```
jobescape-careers/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── careers/        # Public careers pages
│   │   └── dashboard/      # Recruiter dashboard
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   ├── jobs/           # Job-related components
│   │   ├── candidates/     # Candidate components
│   │   ├── dashboard/      # Dashboard components
│   │   └── layout/         # Layout components
│   └── lib/
│       ├── prisma.ts       # Prisma client
│       ├── auth.ts         # Auth utilities
│       ├── ai.ts           # AI functions
│       └── upload.ts       # File upload utilities
└── package.json
```

## Database Schema

- **User** - Recruiter accounts
- **Job** - Job postings
- **Candidate** - Candidate profiles
- **Application** - Job applications
- **Interview** - Interview scheduling
- **ScreeningQuestion** - Auto-generated screening questions

## API Endpoints

### Public
- `GET /api/jobs` - List published jobs
- `GET /api/jobs/[slug]` - Get job details
- `POST /api/applications` - Submit application

### Protected (requires auth)
- `GET /api/candidates` - List candidates
- `GET /api/candidates/[id]` - Get candidate details
- `PUT /api/candidates/[id]` - Update candidate
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Schedule interview
- `GET /api/analytics` - Dashboard analytics

## AI Features

1. **Resume Parsing** - Extract structured data from resumes
2. **Candidate Scoring** - Match candidates against job descriptions (0-100 score)
3. **AI Summary** - Generate candidate summaries
4. **Red Flags Detection** - Identify potential concerns
5. **Screening Questions** - Auto-generate role-specific questions

## Customization

### Branding
Update the company name and logo in:
- `src/app/careers/page.tsx`
- `src/components/layout/Sidebar.tsx`

### Email Notifications
Integrate with Resend, SendGrid, or your preferred email provider in the application submission flow.

### File Storage
Currently using local storage. For production, update `src/lib/upload.ts` to use S3, GCS, or similar.

## Production Deployment

1. Set `NEXTAUTH_URL` to your production domain
2. Generate a secure `NEXTAUTH_SECRET`
3. Use a managed PostgreSQL service (Supabase, Neon, etc.)
4. Deploy to Vercel, Railway, or your preferred platform

## License

MIT
