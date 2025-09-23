# HealthMate AI Coding Instructions

## Project Architecture

**HealthMate** is a comprehensive healthcare platform built with Next.js 15 + Turbopack, featuring a multi-role system for patients, pharmacies, delivery partners, laboratories, doctors, and admins.

### Core Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API routes, NextAuth.js for authentication
- **Database**: SQLite with Prisma ORM
- **External**: Python OCR processing with Emergent LLM integration

## Key Patterns & Conventions

### 1. Role-Based Architecture
The system uses a single `User` table with role-specific profile tables:
```typescript
// Each user has ONE role and related profile
enum UserRole { PATIENT, PHARMACY, DELIVERY_PARTNER, LABORATORY, DOCTOR, ADMIN }
```

**Critical**: Always include role-based access control in API routes. Check both `session.user.role` AND fetch the related profile (e.g., `patient`, `pharmacy`) to get the specific ID needed for database queries.

### 2. API Route Patterns
All API routes follow this structure:
```typescript
// GET endpoints filter by user role
if (session.user.role === 'PATIENT') {
  const patient = await prisma.patient.findUnique({ where: { userId: session.user.id } })
  where.patientId = patient.id
}
```

**Always** use `getServerSession(authOptions)` for authentication in API routes, never assume user data.

### 3. Database Relationships
- Use `userId` field in main entities for session mapping
- Role-specific IDs (e.g., `patientId`, `pharmacyId`) for business logic
- Commission tracking: `totalAmount`, `commissionAmount`, `netAmount` pattern
- Approval workflow: `isApproved` boolean on non-patient roles

### 4. File Upload & Processing
- Prescription uploads trigger Python OCR processing via `ocr_processor.py`
- OCR extracts medicine data as JSON stored in `Prescription.ocrData`
- Use `python-shell` package to integrate Node.js ↔ Python

### 5. Development Commands
```bash
npm run dev          # Development with Turbopack
npm run build        # Production build with Turbopack
npx prisma db push   # Apply schema changes
npx prisma studio    # Database browser
npx prisma generate  # Regenerate client
```

## Component Architecture

### Dashboard Layout
- Uses nested layouts: `app/dashboard/layout.tsx` wraps all dashboard pages
- `DashboardHeader` + `DashboardSidebar` provide consistent navigation
- Role-based sidebar navigation in `components/dashboard/sidebar.tsx`

### Authentication Flow
- Custom NextAuth configuration in `lib/auth.ts`
- Includes ALL role profiles in session for immediate access
- Sign-in: `/auth/signin`, Registration: `/auth/signup`
- Session data includes user role and related profile objects

### UI Components
- Radix UI primitives in `components/ui/`
- Tailwind + `class-variance-authority` for component variants
- Use `cn()` utility from `lib/utils.ts` for conditional classes

## Critical Business Logic

### Commission System
```typescript
// Standard 5% commission on all transactions
const { commission, netAmount } = calculateCommission(totalAmount)
// Store all three: totalAmount, commissionAmount, netAmount
```

### Order Workflow
1. Patient creates order → `PENDING`
2. Pharmacy confirms → `CONFIRMED` 
3. Pharmacy processes → `PROCESSING`
4. Ready for pickup → `READY_FOR_DELIVERY`
5. Delivery assignment → `OUT_FOR_DELIVERY`
6. Completion → `DELIVERED`

### Multi-Service Platform
- **Orders**: Medicine ordering with prescription support
- **Lab Bookings**: Test scheduling with sample collection
- **Appointments**: Doctor consultations with video meeting support
- **Deliveries**: Dedicated delivery partner management

## File Naming & Structure
- API routes: `app/api/[resource]/route.ts`
- Dynamic routes: `app/api/[resource]/[id]/route.ts`
- Dashboard pages: `app/dashboard/[role]/page.tsx`
- Components: `components/[category]/[name].tsx`

## Environment Dependencies
- `DATABASE_URL`: SQLite database path
- `NEXTAUTH_SECRET`: NextAuth encryption secret
- `EMERGENT_LLM_KEY`: For Python OCR processing

## Development Workflow
1. **Database changes**: Modify `prisma/schema.prisma` → `npx prisma db push`
2. **New API route**: Create in `app/api/` → add role-based auth → test with session
3. **New dashboard page**: Create in `app/dashboard/[role]/` → ensure layout inheritance
4. **Component updates**: Use existing UI components → follow Radix patterns

**Important**: This system handles sensitive medical data. Always validate user permissions at both the API and database level.