# 🚀 JobEscape Careers - Quick Start Guide

## ✅ Build Completed Successfully!

The application has been built successfully. Now follow these steps to get it running:

---

## 1️⃣ Set Up PostgreSQL Database

### Option A: Using Docker (Recommended for local development)
```bash
docker run --name jobescape-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=jobescape_careers -p 5432:5432 -d postgres:15
```

### Option B: Using a managed service (Production)
- [Supabase](https://supabase.com) - Free tier available
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Railway](https://railway.app) - Easy deployment

---

## 2️⃣ Configure Environment Variables

Edit `.env.local` with your actual credentials:

```bash
# Update DATABASE_URL with your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobescape_careers?schema=public"

# Generate a secure secret (run: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# NextAuth URL
NEXTAUTH_URL="http://localhost:3001"

# AI (optional - for resume parsing and scoring)
ANTHROPIC_API_KEY="your-anthropic-key"
# OR
OPENAI_API_KEY="your-openai-key"

# Email (optional - for notifications)
RESEND_API_KEY=""
FROM_EMAIL="noreply@jobescape.com"
```

---

## 3️⃣ Initialize Database

```bash
cd /Users/timson/Documents/remotion-cloud/jobescape-careers

# Push schema to database
npm run db:push

# Seed database with demo data (creates admin user + sample jobs)
npm run db:seed
```

**Demo Login Credentials:**
- Email: `admin@jobescape.com`
- Password: `admin123`

---

## 4️⃣ Start Development Server

```bash
npm run dev
```

The application will be available at:
- **Careers Portal:** http://localhost:3001/careers
- **Recruiter Dashboard:** http://localhost:3001/dashboard
- **Sign In:** http://localhost:3001/dashboard/signin

---

## 📋 Features Overview

### For Candidates (Public)
- ✅ Browse open positions with filters
- ✅ View detailed job descriptions
- ✅ Apply with resume upload
- ✅ Instant AI feedback on application match score
- ✅ Mobile-friendly application form

### For Recruiters (Dashboard)
- ✅ **Dashboard** - Overview with stats, pipeline, upcoming interviews
- ✅ **Jobs** - Create, edit, publish job postings
- ✅ **Candidates** - CRM view with AI scoring, search, filters
- ✅ **Interviews** - Schedule and track interviews
- ✅ **Analytics** - Source tracking, pipeline metrics

### AI Features
- 🤖 Resume parsing (extract name, email, skills, experience)
- 🤖 Candidate scoring (0-100 match against job description)
- 🤖 AI summary generation
- 🤖 Red flags detection
- 🤖 Auto-generated screening questions (ready to implement)

---

## 📁 Project Structure

```
jobescape-careers/
├── prisma/
│   ├── schema.prisma       # Database models
│   └── seed.ts             # Seed data
├── src/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── careers/        # Public careers pages
│   │   └── dashboard/      # Recruiter dashboard
│   ├── components/
│   │   ├── ui/             # Reusable components
│   │   ├── jobs/           # Job components
│   │   ├── candidates/     # Candidate components
│   │   └── dashboard/      # Dashboard widgets
│   └── lib/
│       ├── prisma.ts       # DB client
│       ├── auth.ts         # Auth utilities
│       ├── ai.ts           # AI functions
│       └── upload.ts       # File uploads
└── uploads/                # Resume storage
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3001)
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed demo data

# Production
npm run build            # Build
npm run start            # Start
```

---

## 🌐 Deployment

### Quick Deploy to Vercel
1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Database for Production
- Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for PostgreSQL
- Update `DATABASE_URL` in environment variables
- Set `NEXTAUTH_URL` to your production domain

---

## 📝 Next Steps

### Immediate (Recommended)
1. ✅ Set up PostgreSQL database
2. ✅ Run `npm run db:push` and `npm run db:seed`
3. ✅ Start the dev server
4. ✅ Create your first job posting

### Enhancements
- [ ] Add email notifications (Resend/SendGrid)
- [ ] Connect cloud storage for resumes (S3/GCS)
- [ ] Add calendar integration for interviews
- [ ] Implement screening questions
- [ ] Add team collaboration features
- [ ] Set up custom domain

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials)
- **UI:** Tailwind CSS + shadcn/ui
- **AI:** Anthropic Claude API
- **File Upload:** Local storage (extendable)

---

## 💡 Support

For questions or issues:
1. Check the README.md for detailed documentation
2. Review the Prisma schema in `prisma/schema.prisma`
3. Check API routes in `src/app/api/`

---

**Built with ❤️ for JobEscape**
