# 🏥 Patkar Clinic — EMR System

Modern Electronic Medical Records system for a single-doctor clinic, built with Next.js 15, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui components
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth / Auth.js v5
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Features

### Roles
- **Doctor** — Consultations, prescriptions, patient history
- **Receptionist** — Appointments, vitals, billing
- **Admin** — Full access + user management

### Modules
1. **Authentication** — Secure login with role-based access
2. **Dashboard** — Daily stats, quick actions, recent patients
3. **Patient Management** — CRUD with auto-generated UHID, search
4. **Appointments** — Daily calendar, status tracking workflow
5. **Vitals** — Record weight, BP, pulse, temperature, SpO2, RBS
6. **Consultations** — Clinical assessment with vitals summary
7. **Prescriptions** — Dynamic medicine builder with print
8. **Investigations** — PDF/image upload with history
9. **Billing** — Preset charges, custom items, receipt
10. **Patient Timeline** — Complete chronological history

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd EMR_clinic
npm install
```

### 2. Set Up Database

Create a Supabase project and get your database credentials.

Update `.env` with your Supabase connection strings:

```env
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

### 3. Push Schema & Seed

```bash
npx prisma db push
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@patkar.clinic | admin123 |
| Doctor | doctor@patkar.clinic | doctor123 |
| Receptionist | receptionist@patkar.clinic | reception123 |

## Clinic Workflow

```
Register Patient → Book Appointment → Record Vitals → Consultation → Prescription → Bill → Complete
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Protected pages
│   │   ├── dashboard/         # Dashboard
│   │   ├── patients/          # Patient CRUD
│   │   ├── appointments/      # Appointment management
│   │   ├── vitals/            # Vital recording
│   │   ├── consultations/     # Doctor consultation
│   │   ├── prescriptions/     # Prescription builder
│   │   ├── investigations/    # Report upload
│   │   ├── billing/           # Bill generation
│   │   └── settings/          # Admin settings
│   └── api/                   # API routes
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # Sidebar, Topbar
│   └── shared/                # Status badges, spinners
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── prisma.ts              # DB client
│   ├── utils.ts               # Utilities
│   ├── constants.ts           # App constants
│   └── validations/           # Zod schemas
└── proxy.ts                   # Auth middleware
```

## License

Private — Patkar Clinic, Palghar
