# Crewset Beta

Crewset Beta is a production-ready SaaS platform designed for freelancers and agencies to track contracts, prevent missed renewals, and visualize revenue at risk. It helps you secure your recurring revenue with smart reminders and insightful dashboards.

![Crewset Dashboard](public/og-image.png)

## Features

- **Contract Tracking**: Track start dates, end dates, values, and renewal probabilities.
- **Smart Reminders**: Automated email notifications for upcoming contract renewals.
- **Revenue Protection**: Visualize revenue at risk and prioritize renewal efforts.
- **Client Management**: Organize client details and contract history.
- **Team Collaboration**: Create organizations and invite team members.
- **Bilingual Support**: Fully localized in English and Turkish.
- **Subscription Billing**: Integrated with Stripe for Free, Pro, and Agency plans.

## Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Emails**: [Resend](https://resend.com/) (Planned/Configured)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Stripe account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/crewset-beta.git
cd crewset-beta
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Rename `.env.local.example` to `.env.local` and update the values with your credentials:

```bash
cp .env.local.example .env.local
```

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for Admin tasks/Webhooks)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe Publishable Key
- `STRIPE_SECRET_KEY`: Stripe Secret Key
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook Signing Secret
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`: Stripe Price ID for Pro Plan
- `NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID`: Stripe Price ID for Agency Plan
- `NEXT_PUBLIC_SITE_URL`: http://localhost:3000 (for local dev)

### 4. Database Setup

1. Go to your Supabase Dashboard > SQL Editor.
2. Run the contents of `supabase/schema.sql`.
3. This will create the necessary tables (`profiles`, `organizations`, `contracts`, `subscriptions`, etc.) and set up Row Level Security (RLS) policies.

### 5. Stripe Setup

1. Create a Product in Stripe for "Pro Plan" and "Agency Plan".
2. Get the Price IDs (e.g., `price_...`) and add them to your `.env.local`.
3. Configure the Stripe Webhook to point to your deployment URL (or use Stripe CLI for local dev).
   - Endpoint: `your-domain.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the **Environment Variables** from your `.env.local` file to the Vercel project settings.
4. Deploy!

## License

This project is licensed under the MIT License.
