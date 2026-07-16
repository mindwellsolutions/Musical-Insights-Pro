# Subscription System Implementation Blueprint

## Project Overview
Implement a comprehensive subscription management system for Musical Insights platform using Stripe as the payment gateway and Supabase Auth for authentication. The system will enforce subscription-based access control, provide user-facing subscription management, and extend admin capabilities to view and manage user subscriptions.

**Project ID:** `jydaltnubswauneffbpj`  
**Admin User ID:** `5d4f3314-4620-47f2-80a8-72752fa30ae5`

---

## System Architecture Overview

### Technology Stack
- **Payment Gateway:** Stripe (Checkout, Customer Portal, Webhooks, Subscriptions API)
- **Authentication:** Supabase Auth with SSR (@supabase/ssr)
- **Database:** PostgreSQL (Supabase)
- **Frontend:** Next.js 14+ App Router, React Query, TypeScript
- **Styling:** Tailwind CSS with custom design system
- **State Management:** React Query for server state, React Context for client state

### Key Features
1. **Subscription Plans:** Multiple tiers (Free, Basic, Premium, Enterprise)
2. **Payment Processing:** Stripe Checkout for new subscriptions
3. **Subscription Management:** Stripe Customer Portal integration
4. **Access Control:** Middleware-based subscription verification
5. **Admin Dashboard:** Extended user management with subscription data
6. **User Dashboard:** Self-service subscription management
7. **Webhook Handling:** Real-time subscription status updates
8. **Invoice Management:** Automated billing and invoice generation
9. **Trial Periods:** Optional free trial support
10. **Proration:** Automatic proration for plan changes

---

## Phase 1: Database Schema Design

### 1.1 Subscription Plans Table

**Table Name:** `subscription_plans`

**Purpose:** Define available subscription tiers and pricing

**Schema:**
```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  max_projects INTEGER,
  max_storage_gb INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active plans
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active, sort_order);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active plans
CREATE POLICY "Public can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Only admins can modify plans (enforced at API level with service role)
CREATE POLICY "Service role can manage plans" ON subscription_plans
  FOR ALL USING (auth.role() = 'service_role');
```

**Plan Examples:**
- **Free Tier:** $0/month, limited features
- **Basic:** $9.99/month or $99/year, standard features
- **Premium:** $29.99/month or $299/year, advanced features
- **Enterprise:** $99.99/month or $999/year, all features + priority support

### 1.2 User Subscriptions Table

**Table Name:** `user_subscriptions`

**Purpose:** Track individual user subscription status and Stripe relationship

**Schema:**
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  subscription_plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN (
    'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'
  )),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Add RLS policies
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all subscriptions
CREATE POLICY "Service role can manage subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.3 Payment Methods Table

**Table Name:** `payment_methods`

**Purpose:** Store user payment method metadata (not sensitive card data)

**Schema:**
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('card', 'bank_account', 'paypal')),
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default);

-- Add RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment methods
CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage payment methods
CREATE POLICY "Service role can manage payment methods" ON payment_methods
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.4 Invoices Table

**Table Name:** `invoices`

**Purpose:** Store invoice history and billing records

**Schema:**
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf TEXT,
  hosted_invoice_url TEXT,
  invoice_number TEXT,
  billing_reason TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);

-- Add RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage invoices
CREATE POLICY "Service role can manage invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.5 Subscription Events Table

**Table Name:** `subscription_events`

**Purpose:** Audit log for subscription changes and webhook events

**Schema:**
```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  event_data JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX idx_subscription_events_created_at ON subscription_events(created_at DESC);
CREATE INDEX idx_subscription_events_processed ON subscription_events(processed);

-- Add RLS policies
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Service role only
CREATE POLICY "Service role can manage events" ON subscription_events
  FOR ALL USING (auth.role() = 'service_role');
```

### 1.6 Database Functions

**Function: Update Subscription Status**
```sql
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_timestamp
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();
```

**Function: Check Active Subscription**
```sql
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
    AND (current_period_end IS NULL OR current_period_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Phase 2: Stripe Integration Setup

### 2.1 Stripe Configuration

**Environment Variables (.env.local):**
```
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product IDs (created in Stripe Dashboard)
STRIPE_PRICE_ID_BASIC_MONTHLY=price_...
STRIPE_PRICE_ID_BASIC_YEARLY=price_...
STRIPE_PRICE_ID_PREMIUM_MONTHLY=price_...
STRIPE_PRICE_ID_PREMIUM_YEARLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_ID_ENTERPRISE_YEARLY=price_...

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/subscription/success
STRIPE_CANCEL_URL=http://localhost:3000/subscription/canceled
```

### 2.2 Stripe Products Setup

**Manual Steps in Stripe Dashboard:**

1. **Create Products:**
   - Navigate to Products → Add Product
   - Create products for: Basic, Premium, Enterprise
   - Add product descriptions and metadata

2. **Create Prices:**
   - For each product, create monthly and yearly pricing
   - Set recurring billing intervals
   - Enable proration for upgrades/downgrades
   - Configure trial periods if needed

3. **Configure Webhooks:**
   - Navigate to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `customer.subscription.trial_will_end`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `invoice.payment_action_required`
     - `payment_method.attached`
     - `payment_method.detached`
     - `checkout.session.completed`

4. **Customer Portal Configuration:**
   - Navigate to Settings → Billing → Customer Portal
   - Enable features:
     - Update payment method
     - View invoices
     - Cancel subscription
     - Update subscription (upgrade/downgrade)
   - Configure cancellation flow
   - Set up proration settings

### 2.3 Stripe SDK Installation

**Package Installation:**
```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

**Dependencies:**
- `stripe`: Server-side Stripe SDK
- `@stripe/stripe-js`: Client-side Stripe SDK for Checkout

---

## Phase 3: API Routes Development

### 3.1 Stripe Client Initialization

**File:** `lib/stripe/stripe-client.ts`

**Purpose:** Initialize Stripe SDK with proper configuration

**Implementation Details:**
- Create singleton Stripe instance using secret key
- Configure API version and TypeScript types
- Export reusable client for server-side operations
- Add error handling and logging

### 3.2 Subscription Management API Routes

**Route Structure:**
```
/api/subscriptions/
  ├── create-checkout-session/route.ts
  ├── create-portal-session/route.ts
  ├── get-subscription/route.ts
  ├── cancel-subscription/route.ts
  ├── update-subscription/route.ts
  └── get-plans/route.ts
```

#### 3.2.1 Create Checkout Session

**File:** `app/api/subscriptions/create-checkout-session/route.ts`

**Purpose:** Create Stripe Checkout session for new subscriptions

**Request Body:**
```typescript
{
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  trialDays?: number;
}
```

**Process Flow:**
1. Authenticate user using Supabase Auth (SSR)
2. Validate price ID exists in subscription_plans table
3. Check if user already has active subscription
4. Retrieve or create Stripe customer ID
5. Create Checkout session with:
   - Customer ID
   - Price ID
   - Success/cancel URLs
   - Trial period (if applicable)
   - Metadata (user_id, plan_id)
6. Return session ID and URL

**Response:**
```typescript
{
  sessionId: string;
  url: string;
}
```

**Error Handling:**
- 401: Unauthorized (no valid session)
- 400: Invalid price ID
- 409: User already has active subscription
- 500: Stripe API error

#### 3.2.2 Create Customer Portal Session

**File:** `app/api/subscriptions/create-portal-session/route.ts`

**Purpose:** Generate Stripe Customer Portal URL for subscription management

**Request Body:**
```typescript
{
  returnUrl?: string;
}
```

**Process Flow:**
1. Authenticate user
2. Retrieve user's Stripe customer ID from user_subscriptions
3. Create portal session with return URL
4. Return portal URL

**Response:**
```typescript
{
  url: string;
}
```

**Portal Features:**
- Update payment method
- View billing history
- Download invoices
- Cancel subscription
- Update subscription plan

#### 3.2.3 Get Subscription Details

**File:** `app/api/subscriptions/get-subscription/route.ts`

**Purpose:** Retrieve current user's subscription information

**Process Flow:**
1. Authenticate user
2. Query user_subscriptions table with user_id
3. Join with subscription_plans for plan details
4. Return subscription data

**Response:**
```typescript
{
  subscription: {
    id: string;
    status: string;
    planName: string;
    planPrice: number;
    interval: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  } | null;
}
```

#### 3.2.4 Cancel Subscription

**File:** `app/api/subscriptions/cancel-subscription/route.ts`

**Purpose:** Cancel user's subscription at period end

**Request Body:**
```typescript
{
  immediately?: boolean; // Default: false (cancel at period end)
}
```

**Process Flow:**
1. Authenticate user
2. Retrieve subscription from database
3. Call Stripe API to cancel subscription
4. Update user_subscriptions table
5. Log event in subscription_events

**Response:**
```typescript
{
  success: boolean;
  message: string;
  cancelAt: string;
}
```

#### 3.2.5 Update Subscription

**File:** `app/api/subscriptions/update-subscription/route.ts`

**Purpose:** Upgrade or downgrade subscription plan

**Request Body:**
```typescript
{
  newPriceId: string;
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
}
```

**Process Flow:**
1. Authenticate user
2. Validate new price ID
3. Retrieve current subscription from Stripe
4. Update subscription with new price
5. Handle proration
6. Update database
7. Log event

**Response:**
```typescript
{
  success: boolean;
  subscription: SubscriptionObject;
}
```

#### 3.2.6 Get Available Plans

**File:** `app/api/subscriptions/get-plans/route.ts`

**Purpose:** Retrieve all active subscription plans

**Process Flow:**
1. Query subscription_plans table (public access)
2. Order by sort_order
3. Return active plans with features

**Response:**
```typescript
{
  plans: Array<{
    id: string;
    name: string;
    description: string;
    priceMonthly: number;
    priceYearly: number;
    interval: string;
    features: string[];
    stripePriceId: string;
  }>;
}
```

### 3.3 Invoice Management API Routes

**Route Structure:**
```
/api/invoices/
  ├── get-invoices/route.ts
  └── download-invoice/route.ts
```

#### 3.3.1 Get User Invoices

**File:** `app/api/invoices/get-invoices/route.ts`

**Purpose:** Retrieve user's billing history

**Query Parameters:**
```typescript
{
  limit?: number; // Default: 10
  offset?: number; // Default: 0
  status?: 'paid' | 'open' | 'void' | 'uncollectible';
}
```

**Process Flow:**
1. Authenticate user
2. Query invoices table with pagination
3. Order by created_at DESC
4. Return invoice list

**Response:**
```typescript
{
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amountDue: number;
    amountPaid: number;
    status: string;
    dueDate: string;
    paidAt: string;
    invoicePdf: string;
    hostedInvoiceUrl: string;
  }>;
  total: number;
  hasMore: boolean;
}
```

#### 3.3.2 Download Invoice

**File:** `app/api/invoices/download-invoice/[invoiceId]/route.ts`

**Purpose:** Generate download link for invoice PDF

**Process Flow:**
1. Authenticate user
2. Verify invoice belongs to user
3. Retrieve invoice PDF URL from Stripe
4. Return PDF URL or redirect

### 3.4 Webhook Handler

**File:** `app/api/webhooks/stripe/route.ts`

**Purpose:** Handle Stripe webhook events for real-time subscription updates

**Critical Implementation Details:**

**Security:**
- Verify webhook signature using STRIPE_WEBHOOK_SECRET
- Reject requests with invalid signatures
- Use raw request body (not parsed JSON)

**Event Handlers:**

1. **checkout.session.completed**
   - Extract customer and subscription IDs
   - Create or update user_subscriptions record
   - Set initial status to 'active' or 'trialing'
   - Log event in subscription_events

2. **customer.subscription.created**
   - Create user_subscriptions record
   - Store subscription metadata
   - Send welcome email (optional)

3. **customer.subscription.updated**
   - Update user_subscriptions status
   - Update current_period_start/end
   - Handle plan changes
   - Update cancel_at_period_end flag
   - Log event

4. **customer.subscription.deleted**
   - Update status to 'canceled'
   - Set canceled_at timestamp
   - Revoke access (handled by middleware)
   - Send cancellation confirmation email

5. **invoice.paid**
   - Create or update invoice record
   - Update payment status
   - Store invoice PDF URL
   - Send receipt email (optional)

6. **invoice.payment_failed**
   - Update subscription status to 'past_due'
   - Create invoice record with failed status
   - Send payment failure notification
   - Log event for admin review

7. **invoice.payment_action_required**
   - Notify user of required action
   - Update subscription status
   - Send email with payment link

8. **customer.subscription.trial_will_end**
   - Send trial ending reminder (3 days before)
   - Notify user to add payment method

**Response:**
- Always return 200 OK to acknowledge receipt
- Log all events for debugging
- Handle idempotency (check stripe_event_id)

**Error Handling:**
- Log errors but don't expose to Stripe
- Retry failed database operations
- Alert admins for critical failures

---

## Phase 4: Authentication & Access Control

### 4.1 Middleware Enhancement

**File:** `middleware.ts`

**Purpose:** Enforce subscription-based access control

**Implementation Details:**

**Protected Routes:**
```typescript
const protectedRoutes = [
  '/dashboard',
  '/projects',
  '/settings',
  '/analytics',
  // Add all routes requiring active subscription
];

const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/subscription/manage',
  '/api/auth',
];
```

**Middleware Logic:**
1. Check if route requires authentication
2. Verify Supabase session using SSR
3. If authenticated, check subscription status:
   - Query user_subscriptions table
   - Verify status is 'active' or 'trialing'
   - Check current_period_end > now()
4. If no active subscription:
   - Redirect to /subscription/required
   - Allow access to subscription management pages
5. If subscription active, allow access
6. Cache subscription status in session (5 min TTL)

**Subscription Check Function:**
```typescript
async function hasActiveSubscription(userId: string): Promise<boolean> {
  // Query database using service role
  // Return true if active/trialing and not expired
  // Cache result in Redis/memory for performance
}
```

### 4.2 Subscription Context Provider

**File:** `contexts/SubscriptionContext.tsx`

**Purpose:** Provide subscription state throughout the application

**Context Shape:**
```typescript
interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  isActive: boolean;
  isTrial: boolean;
  daysUntilRenewal: number;
  refetch: () => Promise<void>;
}
```

**Implementation:**
- Use React Query for data fetching
- Fetch subscription on mount
- Provide refetch function for updates
- Expose subscription status helpers

**Usage:**
```typescript
const { subscription, isActive, isTrial } = useSubscription();
```

### 4.3 Server-Side Auth Utilities

**File:** `lib/auth/subscription-check.ts`

**Purpose:** Server-side subscription verification utilities

**Functions:**

1. **getSubscriptionStatus(userId: string)**
   - Query user_subscriptions with service role
   - Return subscription object or null
   - Use in API routes and server components

2. **requireActiveSubscription(userId: string)**
   - Throw error if no active subscription
   - Use in protected API routes
   - Return subscription object if valid

3. **getSubscriptionFeatures(userId: string)**
   - Return array of enabled features based on plan
   - Use for feature gating

---

## Phase 5: User-Facing Subscription Management

### 5.1 Pricing Page

**File:** `app/pricing/page.tsx`

**Purpose:** Display available subscription plans and pricing

**Design Specifications:**

**Layout:**
- Hero section with headline and value proposition
- Toggle for monthly/yearly billing (show savings)
- 3-4 plan cards in horizontal layout
- Feature comparison table below cards
- FAQ section at bottom
- Sticky CTA bar on mobile

**Plan Card Design:**
- **Dimensions:** 320px width, auto height
- **Spacing:** 24px gap between cards
- **Border:** 1px solid with gradient on hover
- **Shadow:** Subtle elevation, enhanced on hover
- **Highlight:** "Most Popular" badge on recommended plan

**Card Components:**
1. **Header:**
   - Plan name (24px, bold, gradient text for premium)
   - Short description (14px, muted)
   - Badge for "Most Popular" or "Best Value"

2. **Pricing:**
   - Large price display (48px, bold)
   - Currency symbol (24px)
   - Billing interval (14px, muted)
   - Yearly savings badge (if applicable)

3. **Features List:**
   - Checkmark icons (green for included, gray for not included)
   - Feature text (14px)
   - Tooltip for feature details
   - Max 8-10 key features per card

4. **CTA Button:**
   - Full width within card
   - Primary color for recommended plan
   - Secondary color for others
   - "Get Started" or "Upgrade" text
   - Loading state during checkout

**Comparison Table:**
- Sticky header on scroll
- All features listed in rows
- Checkmarks/X marks for each plan
- Expandable categories
- Mobile: Horizontal scroll with sticky first column

**Color Scheme:**
- **Free:** Gray/neutral tones
- **Basic:** Blue gradient
- **Premium:** Purple/violet gradient (highlighted)
- **Enterprise:** Gold/amber gradient

**Interactions:**
1. Click plan card → Open checkout
2. Hover card → Lift animation + glow effect
3. Toggle billing → Smooth price transition
4. Click feature → Show tooltip with details

**Responsive Design:**
- Desktop: 4 cards horizontal
- Tablet: 2x2 grid
- Mobile: Vertical stack with horizontal scroll option

### 5.2 Subscription Management Page

**File:** `app/subscription/manage/page.tsx`

**Purpose:** Self-service subscription management dashboard

**Route:** `/subscription/manage`

**Design Specifications:**

**Layout Structure:**
```
┌─────────────────────────────────────────────────┐
│  Page Header                                     │
│  "Manage Subscription"                           │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Current Plan Card                               │
│  ┌──────────────┐  ┌─────────────────────────┐ │
│  │ Plan Badge   │  │ Plan Details            │ │
│  │ "Premium"    │  │ • Status: Active        │ │
│  └──────────────┘  │ • Renews: Jan 15, 2026  │ │
│                     │ • $29.99/month          │ │
│                     └─────────────────────────┘ │
│  [Change Plan] [Cancel Subscription]            │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Payment Method Card                             │
│  💳 Visa ending in 4242                         │
│  Expires 12/2026                                 │
│  [Update Payment Method]                         │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Billing History                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Invoice #1234 | Jan 1, 2026 | $29.99     │ │
│  │ [Download PDF] [View Details]             │ │
│  ├───────────────────────────────────────────┤ │
│  │ Invoice #1233 | Dec 1, 2025 | $29.99     │ │
│  │ [Download PDF] [View Details]             │ │
│  └───────────────────────────────────────────┘ │
│  [View All Invoices]                             │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Usage & Limits (if applicable)                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Projects: 5/10                                  │
│  Storage: 2.3 GB / 50 GB                         │
└─────────────────────────────────────────────────┘
```

**Component Breakdown:**

#### 5.2.1 Current Plan Card

**Design:**
- **Card Size:** Full width, max 800px
- **Background:** Gradient based on plan tier
- **Border Radius:** 16px
- **Padding:** 32px
- **Shadow:** Medium elevation

**Content:**
1. **Plan Badge:**
   - Pill shape with plan name
   - Icon representing tier
   - Animated gradient background

2. **Status Indicator:**
   - Green dot for active
   - Yellow for trial
   - Red for past due
   - Gray for canceled

3. **Plan Details:**
   - Plan name (24px, bold)
   - Billing amount and interval
   - Next billing date
   - Renewal/cancellation status
   - Trial end date (if applicable)

4. **Action Buttons:**
   - **Change Plan:** Opens plan selection modal
   - **Cancel Subscription:** Opens cancellation flow
   - **Reactivate:** If canceled but still in period
   - Buttons: 140px width, 40px height, rounded

**States:**
- **Active:** Full functionality
- **Trial:** Show days remaining banner
- **Past Due:** Warning banner with payment link
- **Canceled:** Show reactivation option

#### 5.2.2 Payment Method Card

**Design:**
- **Card Size:** Full width, max 800px
- **Background:** White/dark mode adaptive
- **Border:** 1px solid border
- **Padding:** 24px

**Content:**
1. **Card Display:**
   - Card brand icon (Visa, Mastercard, etc.)
   - Last 4 digits
   - Expiration date
   - Default badge (if multiple cards)

2. **Actions:**
   - **Update Payment Method:** Opens Stripe Customer Portal
   - **Add Payment Method:** If none exists
   - Button: Primary style, full width on mobile

**Security Note:**
- Never display full card numbers
- All updates through Stripe Customer Portal
- PCI compliance maintained

#### 5.2.3 Billing History Section

**Design:**
- **Table/List View:** Responsive design
- **Max Items:** 5 recent invoices
- **Pagination:** Load more button

**Invoice Row:**
1. **Invoice Number:** Clickable link
2. **Date:** Formatted (MMM DD, YYYY)
3. **Amount:** Currency formatted
4. **Status Badge:** Paid (green), Open (yellow), Failed (red)
5. **Actions:**
   - Download PDF icon button
   - View details link

**Empty State:**
- Illustration of empty inbox
- "No invoices yet" message
- Helpful text about first billing

#### 5.2.4 Usage & Limits Card

**Design:**
- **Progress Bars:** Animated, gradient fill
- **Percentage Display:** Show usage ratio
- **Warning States:** Yellow at 80%, red at 95%

**Metrics:**
- Projects created vs. limit
- Storage used vs. limit
- API calls (if applicable)
- Team members (if applicable)

**Upgrade Prompt:**
- Show when approaching limits
- CTA to upgrade plan
- Highlight benefits of next tier

### 5.3 Plan Change Modal

**File:** `components/subscription/PlanChangeModal.tsx`

**Purpose:** Allow users to upgrade/downgrade plans

**Design:**

**Modal Specifications:**
- **Size:** 600px width, auto height
- **Overlay:** Semi-transparent backdrop
- **Animation:** Slide up from bottom on mobile, fade in on desktop

**Content:**
1. **Header:**
   - "Change Your Plan"
   - Close button (X icon)

2. **Current Plan Display:**
   - Small card showing current plan
   - "You're currently on [Plan Name]"

3. **Available Plans:**
   - Radio button selection
   - Plan cards (compact version)
   - Highlight differences from current plan

4. **Proration Notice:**
   - Calculate and display proration amount
   - "You'll be charged $X.XX today"
   - "Your next bill will be $Y.YY on [date]"

5. **Confirmation:**
   - Checkbox: "I understand the changes"
   - Primary button: "Confirm Change"
   - Secondary button: "Cancel"

**Logic:**
- Disable downgrade if would lose data
- Show warning for feature loss
- Calculate proration in real-time
- Handle loading states

### 5.4 Cancellation Flow

**File:** `components/subscription/CancellationFlow.tsx`

**Purpose:** Guide users through subscription cancellation

**Design:**

**Multi-Step Process:**

**Step 1: Cancellation Reason**
- Modal with reason selection
- Options:
  - Too expensive
  - Not using enough
  - Missing features
  - Found alternative
  - Other (text input)
- Optional feedback textarea
- Buttons: "Continue" / "Keep Subscription"

**Step 2: Retention Offer (Optional)**
- Based on reason, show:
  - Discount offer (if price concern)
  - Feature highlights (if not using)
  - Downgrade option (if too expensive)
- Buttons: "Accept Offer" / "Continue Canceling"

**Step 3: Confirmation**
- Summary of what happens:
  - Access until period end
  - No further charges
  - Data retention policy
- Checkbox: "I understand"
- Buttons: "Cancel Subscription" (red) / "Keep Subscription" (green)

**Step 4: Confirmation Screen**
- Success message
- Access end date
- Reactivation instructions
- Feedback thank you
- Button: "Return to Dashboard"

**Design Specifications:**
- **Modal Width:** 500px
- **Progress Indicator:** Step dots at top
- **Tone:** Empathetic, not pushy
- **Colors:** Use red sparingly, only on final confirm

### 5.5 Subscription Required Page

**File:** `app/subscription/required/page.tsx`

**Purpose:** Landing page for users without active subscription

**Design:**

**Layout:**
```
┌─────────────────────────────────────────────────┐
│  🔒 Icon                                        │
│  Subscription Required                          │
│  Access premium features with a subscription    │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  Feature Highlights                              │
│  ✓ Unlimited projects                           │
│  ✓ Advanced analytics                           │
│  ✓ Priority support                             │
│  ✓ Export capabilities                          │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│  [View Pricing Plans]                           │
│  [Contact Sales]                                 │
└─────────────────────────────────────────────────┘
```

**Design Specifications:**
- **Centered Layout:** Max 600px width
- **Icon:** Lock or premium badge (64px)
- **Headline:** 32px, bold
- **Subheadline:** 18px, muted
- **Feature List:** Checkmarks with gradient
- **CTA Buttons:** Large, prominent
- **Background:** Subtle gradient or pattern

**States:**
- **No Subscription:** Show pricing CTA
- **Expired Trial:** Show "Upgrade Now" with urgency
- **Past Due:** Show "Update Payment" with warning
- **Canceled:** Show "Reactivate" option

---

## Phase 6: Admin Dashboard Enhancement

### 6.1 Admin User List Enhancement

**File:** `app/admin/users/page.tsx`

**Purpose:** Display users with subscription status

**Current State:** Existing admin user list

**Enhancements Needed:**

**Table Columns to Add:**
1. **Subscription Status:**
   - Badge with color coding
   - Active (green), Trial (blue), Canceled (gray), Past Due (red)

2. **Plan Name:**
   - Display current plan
   - "Free" for non-subscribers

3. **MRR (Monthly Recurring Revenue):**
   - Calculated monthly value
   - Sorted column

4. **Next Billing Date:**
   - Date display
   - "N/A" for canceled/free

**Filters to Add:**
- Subscription status dropdown
- Plan type dropdown
- Payment status dropdown
- Date range for subscription start

**Bulk Actions:**
- Export subscriber list
- Send notification to subscribers
- Apply discount code

**Design Specifications:**
- **Table Row Height:** 60px
- **Status Badge:** 80px width, pill shape
- **Hover State:** Highlight row, show quick actions
- **Click Action:** Navigate to user detail page

### 6.2 Admin User Detail Page

**File:** `app/admin/users/[userId]/page.tsx`

**Purpose:** Comprehensive user subscription management for admins

**Route:** `/admin/users/[userId]`

**Design Specifications:**

**Page Layout:**
```
┌─────────────────────────────────────────────────┐
│  User Header                                     │
│  ┌──────┐  John Doe                             │
│  │Avatar│  john@example.com                     │
│  └──────┘  Member since: Jan 1, 2025            │
│  [Edit User] [Send Email] [Delete User]         │
└─────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Subscription Card    │  │ Financial Summary    │
│                      │  │                      │
│ Status: Active       │  │ Lifetime Value: $500 │
│ Plan: Premium        │  │ MRR: $29.99          │
│ Since: Dec 1, 2025   │  │ Total Paid: $500     │
│ Renews: Feb 1, 2026  │  │ Outstanding: $0      │
│                      │  │                      │
│ [View in Stripe]     │  │ [View Transactions]  │
└──────────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────┐
│  Subscription Timeline                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Dec 1 ●────● Jan 1 ●────● Feb 1               │
│  Started   Renewed   Next Billing               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Payment Methods                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ 💳 Visa •••• 4242                         │ │
│  │ Expires: 12/2026                          │ │
│  │ Default                                    │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Billing History                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ Date       │ Amount  │ Status │ Invoice  │ │
│  ├───────────────────────────────────────────┤ │
│  │ Jan 1, 26  │ $29.99  │ Paid   │ [PDF]    │ │
│  │ Dec 1, 25  │ $29.99  │ Paid   │ [PDF]    │ │
│  │ Nov 1, 25  │ $29.99  │ Paid   │ [PDF]    │ │
│  └───────────────────────────────────────────┘ │
│  [Load More]                                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Subscription Events Log                         │
│  ┌───────────────────────────────────────────┐ │
│  │ Jan 15, 2026 10:30 AM                     │ │
│  │ Subscription renewed                       │ │
│  │ Amount: $29.99                             │ │
│  ├───────────────────────────────────────────┤ │
│  │ Dec 15, 2025 10:30 AM                     │ │
│  │ Subscription renewed                       │ │
│  │ Amount: $29.99                             │ │
│  └───────────────────────────────────────────┘ │
│  [View All Events]                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Admin Actions                                   │
│  [Change Plan] [Apply Discount] [Refund]        │
│  [Cancel Subscription] [Extend Trial]           │
│  [Send Invoice] [Reset Password]                │
└─────────────────────────────────────────────────┘
```

#### 6.2.1 Subscription Card

**Design:**
- **Card Size:** 400px width, auto height
- **Background:** Gradient based on plan
- **Border Radius:** 12px
- **Padding:** 24px

**Content:**
1. **Status Badge:**
   - Large, prominent
   - Color-coded by status
   - Icon + text

2. **Plan Information:**
   - Plan name (20px, bold)
   - Billing interval
   - Price per period

3. **Dates:**
   - Subscription start date
   - Current period start/end
   - Next billing date
   - Trial end (if applicable)
   - Cancellation date (if applicable)

4. **Quick Actions:**
   - "View in Stripe" → Opens Stripe dashboard
   - "Edit Subscription" → Admin override modal

**Status Colors:**
- Active: Green (#10B981)
- Trial: Blue (#3B82F6)
- Past Due: Orange (#F59E0B)
- Canceled: Gray (#6B7280)
- Unpaid: Red (#EF4444)

#### 6.2.2 Financial Summary Card

**Design:**
- **Card Size:** 400px width, auto height
- **Background:** White/dark adaptive
- **Border:** 1px solid
- **Padding:** 24px

**Metrics:**
1. **Lifetime Value (LTV):**
   - Total revenue from user
   - Large display (32px)
   - Currency formatted

2. **Monthly Recurring Revenue (MRR):**
   - Current monthly value
   - Annualized if yearly plan

3. **Total Paid:**
   - Sum of all successful payments
   - Link to transaction history

4. **Outstanding Balance:**
   - Unpaid invoices
   - Red if > 0

5. **Average Invoice:**
   - Mean payment amount

6. **Payment Success Rate:**
   - Percentage of successful payments
   - Progress bar visualization

**Actions:**
- "View Transactions" → Detailed payment log
- "Export Financial Data" → CSV download

#### 6.2.3 Subscription Timeline

**Design:**
- **Visual:** Horizontal timeline with nodes
- **Width:** Full width, responsive
- **Height:** 120px

**Timeline Nodes:**
1. **Subscription Created:**
   - Date and time
   - Initial plan

2. **Plan Changes:**
   - Upgrade/downgrade events
   - Old plan → New plan

3. **Renewals:**
   - Each successful billing
   - Amount charged

4. **Failed Payments:**
   - Red node
   - Reason if available

5. **Cancellation:**
   - If applicable
   - Reason if provided

6. **Future Events:**
   - Next billing (dashed line)
   - Trial end
   - Scheduled cancellation

**Interactions:**
- Hover node → Show details tooltip
- Click node → Expand event details
- Zoom controls for long timelines

#### 6.2.4 Billing History Table

**Design:**
- **Table Style:** Modern, clean lines
- **Row Height:** 48px
- **Alternating Rows:** Subtle background
- **Sticky Header:** On scroll

**Columns:**
1. **Invoice Number:** Clickable link
2. **Date:** Formatted date
3. **Description:** Subscription period
4. **Amount:** Currency formatted
5. **Status:** Badge (Paid, Open, Failed, Void)
6. **Actions:** Download PDF, View details, Refund

**Pagination:**
- 10 items per page
- Load more button
- Total count display

**Filters:**
- Date range picker
- Status filter
- Amount range

**Empty State:**
- "No invoices found"
- Helpful message

#### 6.2.5 Subscription Events Log

**Design:**
- **List Style:** Timeline format
- **Max Height:** 400px with scroll
- **Item Height:** Variable

**Event Types:**
1. **Subscription Created**
2. **Subscription Updated**
3. **Subscription Canceled**
4. **Payment Succeeded**
5. **Payment Failed**
6. **Plan Changed**
7. **Trial Started/Ended**
8. **Refund Issued**

**Event Display:**
- Timestamp (relative + absolute)
- Event type icon
- Event description
- Metadata (expandable JSON)
- Stripe event ID (for debugging)

**Filters:**
- Event type dropdown
- Date range
- Search by event ID

#### 6.2.6 Admin Actions Panel

**Design:**
- **Layout:** Button grid
- **Button Size:** 160px width, 40px height
- **Spacing:** 12px gap
- **Style:** Outlined buttons with icons

**Actions:**

1. **Change Plan:**
   - Opens plan selection modal
   - Admin can override without payment
   - Logs action in events

2. **Apply Discount:**
   - Create coupon code
   - Apply percentage or fixed discount
   - Set duration (once, forever, repeating)

3. **Refund Payment:**
   - Select invoice to refund
   - Full or partial refund
   - Reason required
   - Confirmation dialog

4. **Cancel Subscription:**
   - Immediate or at period end
   - Reason optional
   - Confirmation required
   - Sends notification to user

5. **Extend Trial:**
   - Add days to trial period
   - Only if in trial or recently ended
   - Notification sent

6. **Send Invoice:**
   - Manually trigger invoice
   - For custom charges
   - Email to user

7. **Pause Subscription:**
   - Temporarily pause billing
   - Set resume date
   - Stripe feature (if enabled)

8. **Add Credit:**
   - Apply account credit
   - Offset future invoices
   - Reason required

**Confirmation Modals:**
- All destructive actions require confirmation
- Show impact of action
- Require admin password for critical actions

### 6.3 Admin Analytics Dashboard

**File:** `app/admin/analytics/subscriptions/page.tsx`

**Purpose:** Subscription metrics and business intelligence

**Route:** `/admin/analytics/subscriptions`

**Design Specifications:**

**Page Layout:**
```
┌─────────────────────────────────────────────────┐
│  Key Metrics Row                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │   MRR    │ │  Active  │ │  Churn   │        │
│  │ $12,450  │ │   342    │ │  2.3%    │        │
│  │  +12%    │ │   +23    │ │  -0.5%   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Revenue Chart                                   │
│  [Line graph showing MRR over time]             │
│  Time range: [Last 30 days ▼]                   │
└─────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────┐
│ Plan Distribution    │  │ Subscription Status  │
│ [Pie chart]          │  │ [Donut chart]        │
└──────────────────────┘  └──────────────────────┘

┌─────────────────────────────────────────────────┐
│  Recent Subscriptions                            │
│  [Table of latest sign-ups]                     │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Churn Analysis                                  │
│  [Reasons for cancellation breakdown]           │
└─────────────────────────────────────────────────┘
```

**Key Metrics Cards:**

1. **Monthly Recurring Revenue (MRR):**
   - Current MRR
   - Change from last period (% and $)
   - Trend indicator (up/down arrow)
   - Sparkline chart

2. **Active Subscribers:**
   - Total count
   - New this period
   - Churned this period
   - Net change

3. **Churn Rate:**
   - Percentage
   - Trend
   - Comparison to industry average

4. **Average Revenue Per User (ARPU):**
   - Current ARPU
   - By plan tier
   - Trend

5. **Lifetime Value (LTV):**
   - Average LTV
   - By cohort
   - LTV:CAC ratio

6. **Trial Conversion Rate:**
   - Percentage converting to paid
   - By plan
   - Trend

**Charts:**

1. **Revenue Over Time:**
   - Line chart
   - MRR, ARR options
   - Filterable by plan
   - Date range selector

2. **Plan Distribution:**
   - Pie or donut chart
   - Subscriber count by plan
   - Revenue by plan toggle

3. **Subscription Status:**
   - Active, Trial, Past Due, Canceled
   - Color-coded segments
   - Percentage labels

4. **Cohort Analysis:**
   - Retention by signup month
   - Heatmap visualization
   - Export capability

**Tables:**

1. **Recent Subscriptions:**
   - Last 10 new subscribers
   - User, plan, date, amount
   - Link to user detail

2. **Upcoming Renewals:**
   - Next 30 days
   - Potential revenue
   - At-risk indicators

3. **Failed Payments:**
   - Recent failures
   - User, amount, reason
   - Retry status

**Filters:**
- Date range picker
- Plan type
- Subscription status
- Payment method

**Export Options:**
- CSV export
- PDF report
- Email scheduled reports

---

## Phase 7: Navigation & Menu Updates

### 7.1 Main Navigation Menu

**File:** `components/layout/Navigation.tsx` or similar

**Changes Required:**

**Add Menu Item:**
- **Label:** "Manage Subscription"
- **Icon:** Credit card or subscription icon
- **Route:** `/subscription/manage`
- **Position:** In user dropdown or main nav
- **Visibility:** Authenticated users only

**Menu Structure:**
```
User Dropdown Menu:
├── Dashboard
├── Profile Settings
├── Manage Subscription  ← NEW
├── Billing History      ← NEW (optional, or part of Manage)
├── Help & Support
└── Logout
```

**Design Specifications:**
- **Icon:** Use credit card, dollar sign, or crown icon
- **Badge:** Show "Trial" or "Upgrade" if applicable
- **Highlight:** Different color for trial users
- **Mobile:** Include in hamburger menu

### 7.2 Admin Navigation

**File:** `components/admin/AdminNavigation.tsx` or similar

**Changes Required:**

**Add Menu Items:**
1. **Subscriptions:**
   - Route: `/admin/subscriptions`
   - Icon: Credit card stack
   - Badge: Count of active subscriptions

2. **Analytics:**
   - Route: `/admin/analytics/subscriptions`
   - Icon: Chart/graph
   - Submenu: Revenue, Churn, Cohorts

**Admin Menu Structure:**
```
Admin Navigation:
├── Dashboard
├── Users
├── Subscriptions        ← NEW
│   ├── Active
│   ├── Trials
│   ├── Canceled
│   └── Past Due
├── Analytics            ← ENHANCED
│   ├── Overview
│   ├── Subscriptions   ← NEW
│   └── Revenue         ← NEW
├── Settings
└── Logs
```

### 7.3 Subscription Status Indicator

**Component:** `components/subscription/SubscriptionBadge.tsx`

**Purpose:** Display subscription status in header/nav

**Design:**
- **Position:** Top right corner or user menu
- **Badge Types:**
  - "Free" - Gray
  - "Trial" - Blue with days remaining
  - "Premium" - Purple/gold gradient
  - "Past Due" - Red with warning icon

**Interactions:**
- Click → Navigate to subscription management
- Hover → Show tooltip with details

---

## Phase 8: Email Notifications

### 8.1 Email Templates

**Technology:** Use email service (SendGrid, Resend, or similar)

**Templates Required:**

1. **Welcome Email (New Subscription):**
   - Subject: "Welcome to [App Name] Premium!"
   - Content: Thank you, plan details, getting started guide
   - CTA: "Get Started"

2. **Trial Started:**
   - Subject: "Your [App Name] trial has begun"
   - Content: Trial duration, features, conversion reminder
   - CTA: "Explore Features"

3. **Trial Ending Soon (3 days before):**
   - Subject: "Your trial ends in 3 days"
   - Content: Reminder, add payment method, plan options
   - CTA: "Subscribe Now"

4. **Trial Ended:**
   - Subject: "Your trial has ended"
   - Content: Subscribe to continue, plan options
   - CTA: "Choose a Plan"

5. **Payment Successful:**
   - Subject: "Payment received - Invoice #[number]"
   - Content: Thank you, amount, invoice link
   - CTA: "View Invoice"

6. **Payment Failed:**
   - Subject: "Payment failed - Action required"
   - Content: Update payment method, retry date
   - CTA: "Update Payment Method"
   - Urgency: High priority

7. **Subscription Renewed:**
   - Subject: "Your subscription has been renewed"
   - Content: Thank you, next billing date, invoice
   - CTA: "View Invoice"

8. **Subscription Canceled:**
   - Subject: "Your subscription has been canceled"
   - Content: Access until date, reactivation option, feedback
   - CTA: "Reactivate" or "Give Feedback"

9. **Subscription Reactivated:**
   - Subject: "Welcome back to [App Name]!"
   - Content: Reactivation confirmation, plan details
   - CTA: "Continue to Dashboard"

10. **Plan Changed:**
    - Subject: "Your plan has been updated"
    - Content: New plan details, proration, next billing
    - CTA: "View Subscription"

11. **Refund Processed:**
    - Subject: "Refund processed for Invoice #[number]"
    - Content: Amount, reason, timeline
    - CTA: "View Details"

**Email Design Specifications:**
- **Width:** 600px max (Outlook compatible)
- **Layout:** Table-based for compatibility
- **Styling:** Inline CSS only
- **Logo:** Include brand logo at top
- **Footer:** Unsubscribe link, company info, social links
- **CTA Button:** 200px width, 48px height, rounded corners
- **Colors:** Match brand colors
- **Responsive:** Mobile-friendly design

### 8.2 Email Sending Service

**File:** `lib/email/subscription-emails.ts`

**Functions:**

```typescript
async function sendWelcomeEmail(userId: string, subscription: Subscription)
async function sendTrialStartedEmail(userId: string, trialEnd: Date)
async function sendTrialEndingEmail(userId: string, daysRemaining: number)
async function sendPaymentSuccessEmail(userId: string, invoice: Invoice)
async function sendPaymentFailedEmail(userId: string, invoice: Invoice)
async function sendSubscriptionCanceledEmail(userId: string, accessEnd: Date)
// ... etc
```

**Implementation:**
- Use email service API (SendGrid, Resend, etc.)
- Template variables for personalization
- Error handling and retry logic
- Logging for debugging
- Unsubscribe handling

---

## Phase 9: Testing Strategy

### 9.1 Stripe Test Mode

**Setup:**
- Use Stripe test keys for development
- Create test products and prices
- Use test card numbers

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`
- Insufficient funds: `4000 0000 0000 9995`

### 9.2 Test Scenarios

**Subscription Creation:**
1. New user signs up for trial
2. User subscribes to paid plan
3. User upgrades from free to paid
4. User downgrades from premium to basic
5. User cancels subscription
6. User reactivates canceled subscription

**Payment Scenarios:**
1. Successful payment
2. Failed payment (insufficient funds)
3. Payment requires authentication (3D Secure)
4. Payment method expired
5. Refund processing
6. Proration calculation

**Webhook Testing:**
1. Use Stripe CLI for local webhook testing
2. Test each webhook event type
3. Verify database updates
4. Check email notifications
5. Test idempotency

**Access Control:**
1. Verify middleware blocks non-subscribers
2. Test subscription expiration
3. Test trial period access
4. Test grace period for past due

**Admin Functions:**
1. View user subscription details
2. Change user plan
3. Apply discount
4. Issue refund
5. Cancel subscription
6. View analytics

### 9.3 Automated Tests

**Unit Tests:**
- Subscription status calculation
- Proration logic
- Access control functions
- Email template rendering

**Integration Tests:**
- API route handlers
- Webhook processing
- Database operations
- Stripe API calls (mocked)

**E2E Tests:**
- Complete subscription flow
- Payment processing
- Cancellation flow
- Admin operations

---

## Phase 10: Security & Compliance

### 10.1 Security Measures

**API Security:**
1. **Authentication:**
   - All routes require valid Supabase session
   - Use SSR for server-side auth
   - Verify user identity on every request

2. **Authorization:**
   - Users can only access own subscription data
   - Admin routes require admin role check
   - Service role for database operations

3. **Webhook Security:**
   - Verify Stripe signature
   - Use webhook secret
   - Reject invalid signatures
   - Implement replay attack prevention

4. **Data Protection:**
   - Never store full card numbers
   - Use Stripe for PCI compliance
   - Encrypt sensitive metadata
   - Implement RLS policies

**Rate Limiting:**
- Implement rate limiting on API routes
- Prevent abuse of checkout creation
- Limit webhook processing

### 10.2 PCI Compliance

**Stripe Handles:**
- Card data collection
- Card storage
- Payment processing
- PCI compliance

**Application Responsibilities:**
- Never request card details directly
- Use Stripe Elements or Checkout
- Don't log card information
- Secure webhook endpoints

### 10.3 Data Privacy

**GDPR Compliance:**
1. **Data Collection:**
   - Collect only necessary data
   - Document data usage
   - Provide privacy policy

2. **User Rights:**
   - Right to access data
   - Right to delete data
   - Right to export data
   - Right to rectification

3. **Data Retention:**
   - Define retention periods
   - Automatic deletion after cancellation (optional)
   - Archive old invoices

**Implementation:**
- Add data export functionality
- Implement account deletion
- Provide subscription data download
- Clear cookie consent

---

## Phase 11: Performance Optimization

### 11.1 Caching Strategy

**Subscription Status:**
- Cache in session storage (5 min TTL)
- Invalidate on subscription changes
- Use React Query for client-side caching

**Plan Data:**
- Cache subscription plans (1 hour TTL)
- Rarely changes, safe to cache
- Invalidate on admin updates

**Invoice Data:**
- Cache recent invoices (10 min TTL)
- Paginate for performance
- Lazy load older invoices

### 11.2 Database Optimization

**Indexes:**
- Already defined in schema
- Monitor query performance
- Add composite indexes if needed

**Query Optimization:**
- Use select specific columns
- Avoid N+1 queries
- Use joins efficiently
- Implement pagination

### 11.3 React Query Configuration

**File:** `lib/react-query/subscription-queries.ts`

**Query Keys:**
```typescript
const subscriptionKeys = {
  all: ['subscriptions'] as const,
  detail: (userId: string) => [...subscriptionKeys.all, userId] as const,
  invoices: (userId: string) => [...subscriptionKeys.all, 'invoices', userId] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
};
```

**Queries:**
- `useSubscription()`: Fetch current subscription
- `useInvoices()`: Fetch invoice history
- `usePlans()`: Fetch available plans
- `useSubscriptionStatus()`: Check active status

**Mutations:**
- `useCreateCheckout()`: Create checkout session
- `useCancelSubscription()`: Cancel subscription
- `useUpdateSubscription()`: Change plan

**Configuration:**
- Stale time: 5 minutes for subscription
- Cache time: 10 minutes
- Retry: 3 attempts with exponential backoff
- Refetch on window focus: true

---

## Phase 12: Deployment Checklist

### 12.1 Pre-Deployment

**Environment Variables:**
- [ ] Set production Stripe keys
- [ ] Configure webhook secret
- [ ] Set production URLs
- [ ] Configure email service

**Stripe Configuration:**
- [ ] Create production products
- [ ] Set up production prices
- [ ] Configure webhook endpoint
- [ ] Test webhook delivery
- [ ] Configure Customer Portal
- [ ] Set up tax collection (if applicable)

**Database:**
- [ ] Run migrations on production
- [ ] Seed subscription plans
- [ ] Verify RLS policies
- [ ] Test database connections

**Testing:**
- [ ] Run all automated tests
- [ ] Manual testing in staging
- [ ] Test webhook processing
- [ ] Verify email delivery
- [ ] Test payment flows

### 12.2 Post-Deployment

**Monitoring:**
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor webhook delivery
- [ ] Track failed payments
- [ ] Monitor subscription metrics
- [ ] Set up alerts for critical errors

**Documentation:**
- [ ] Update API documentation
- [ ] Create admin user guide
- [ ] Document troubleshooting steps
- [ ] Create runbook for common issues

**User Communication:**
- [ ] Announce new subscription system
- [ ] Provide migration guide (if applicable)
- [ ] Update help documentation
- [ ] Train support team

---

## Phase 13: Maintenance & Monitoring

### 13.1 Regular Tasks

**Daily:**
- Monitor failed payments
- Check webhook delivery
- Review error logs
- Monitor churn rate

**Weekly:**
- Review subscription metrics
- Analyze cancellation reasons
- Check for payment issues
- Update financial reports

**Monthly:**
- Reconcile Stripe data with database
- Review and optimize queries
- Update subscription plans (if needed)
- Analyze cohort retention

### 13.2 Metrics to Track

**Business Metrics:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Churn rate
- ARPU (Average Revenue Per User)
- LTV (Lifetime Value)
- CAC (Customer Acquisition Cost)
- Trial conversion rate
- Plan distribution

**Technical Metrics:**
- Webhook success rate
- Payment success rate
- API response times
- Database query performance
- Error rates
- Uptime

### 13.3 Alerting

**Critical Alerts:**
- Webhook endpoint down
- Database connection failures
- Stripe API errors
- High payment failure rate
- Sudden churn spike

**Warning Alerts:**
- Slow API responses
- High error rate
- Low trial conversion
- Unusual subscription patterns

---

## Phase 14: Future Enhancements

### 14.1 Potential Features

**Advanced Billing:**
- Usage-based billing
- Metered billing
- Add-ons and extras
- Custom pricing for enterprise
- Multi-currency support
- Tax calculation automation

**User Experience:**
- In-app upgrade prompts
- Feature usage tracking
- Personalized plan recommendations
- Referral program
- Loyalty rewards

**Admin Tools:**
- Advanced analytics dashboard
- Cohort analysis
- Revenue forecasting
- Churn prediction
- Automated retention campaigns

**Integrations:**
- Accounting software (QuickBooks, Xero)
- CRM integration (Salesforce, HubSpot)
- Analytics platforms (Mixpanel, Amplitude)
- Customer support (Intercom, Zendesk)

### 14.2 Scalability Considerations

**High Volume:**
- Implement queue for webhook processing
- Use Redis for caching
- Database read replicas
- CDN for static assets
- Horizontal scaling

**Global Expansion:**
- Multi-region deployment
- Currency localization
- Tax compliance by region
- Payment method localization

---

## Implementation Timeline

### Week 1-2: Foundation
- Database schema creation
- Stripe account setup
- Basic API routes
- Authentication integration

### Week 3-4: Core Features
- Subscription creation flow
- Webhook handling
- Payment processing
- Basic user dashboard

### Week 5-6: User Interface
- Pricing page
- Subscription management page
- Cancellation flow
- Invoice viewing

### Week 7-8: Admin Features
- Admin user list enhancement
- User detail page
- Subscription management
- Basic analytics

### Week 9-10: Polish & Testing
- Email notifications
- Error handling
- Comprehensive testing
- Performance optimization

### Week 11-12: Deployment & Monitoring
- Staging deployment
- Production deployment
- Monitoring setup
- Documentation

---

## Technical Dependencies

### Required Packages
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "@supabase/ssr": "latest",
    "@tanstack/react-query": "^5.0.0",
    "date-fns": "^3.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/stripe": "^8.0.0"
  }
}
```

### Environment Variables Template
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=jydaltnubswauneffbpj

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=Musical Insights

# Email (Optional)
SENDGRID_API_KEY=
RESEND_API_KEY=

# Admin
ADMIN_USER_ID=5d4f3314-4620-47f2-80a8-72752fa30ae5
```

---

## Design System Specifications

### Color Palette

**Subscription Tiers:**
- Free: `#6B7280` (Gray)
- Basic: `#3B82F6` (Blue)
- Premium: `#8B5CF6` (Purple) - Primary highlight
- Enterprise: `#F59E0B` (Amber)

**Status Colors:**
- Active: `#10B981` (Green)
- Trial: `#3B82F6` (Blue)
- Past Due: `#F59E0B` (Orange)
- Canceled: `#6B7280` (Gray)
- Failed: `#EF4444` (Red)

**UI Elements:**
- Primary CTA: `#8B5CF6` (Purple gradient)
- Secondary CTA: `#E5E7EB` (Light gray)
- Danger: `#EF4444` (Red)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)

### Typography

**Headings:**
- H1: 32px, bold, gradient text for premium features
- H2: 24px, bold
- H3: 20px, semibold
- H4: 18px, semibold

**Body:**
- Regular: 16px, normal weight
- Small: 14px
- Tiny: 12px

**Special:**
- Price display: 48px, bold
- Currency: 24px, normal
- Badges: 12px, uppercase, bold

### Spacing

**Card Padding:**
- Small: 16px
- Medium: 24px
- Large: 32px

**Gaps:**
- Tight: 8px
- Normal: 16px
- Loose: 24px
- Extra loose: 32px

### Components

**Buttons:**
- Height: 40px (regular), 48px (large)
- Border radius: 8px
- Padding: 16px 24px
- Font weight: 600

**Cards:**
- Border radius: 12px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
- Hover shadow: 0 10px 15px rgba(0,0,0,0.1)

**Badges:**
- Height: 24px
- Border radius: 12px (pill)
- Padding: 4px 12px
- Font size: 12px

**Inputs:**
- Height: 40px
- Border radius: 6px
- Border: 1px solid
- Focus: 2px ring

---

## Error Handling & Edge Cases

### Common Scenarios

1. **User already has subscription:**
   - Prevent duplicate subscriptions
   - Redirect to manage page
   - Show current plan

2. **Payment method expired:**
   - Detect before renewal
   - Send notification
   - Prompt update

3. **Webhook delivery failure:**
   - Implement retry logic
   - Manual reconciliation tool
   - Alert admins

4. **Proration edge cases:**
   - Same-day plan changes
   - Trial to paid conversion
   - Refund scenarios

5. **Concurrent updates:**
   - Handle race conditions
   - Use database transactions
   - Implement optimistic locking

6. **Stripe API downtime:**
   - Graceful degradation
   - Queue operations
   - Show maintenance message

7. **User deletes account:**
   - Cancel subscription first
   - Handle in Stripe
   - Clean up database

8. **Refund after cancellation:**
   - Verify eligibility
   - Partial vs full refund
   - Update records

---

## Success Criteria

### Functional Requirements
- [ ] Users can subscribe to plans
- [ ] Users can manage subscriptions
- [ ] Users can update payment methods
- [ ] Users can view invoices
- [ ] Users can cancel subscriptions
- [ ] Admins can view all subscriptions
- [ ] Admins can manage user subscriptions
- [ ] Webhooks process correctly
- [ ] Emails send reliably
- [ ] Access control enforced

### Performance Requirements
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] Webhook processing < 5 seconds
- [ ] 99.9% uptime
- [ ] Zero payment data breaches

### Business Requirements
- [ ] Accurate billing
- [ ] Correct proration
- [ ] Reliable renewals
- [ ] Clear cancellation process
- [ ] Comprehensive analytics

---

## Conclusion

This blueprint provides a comprehensive guide for implementing a full-featured subscription system using Stripe and Supabase. The implementation should follow industry best practices for security, performance, and user experience. All components should be built with scalability in mind and thoroughly tested before deployment.

The system prioritizes:
1. **Security:** PCI compliance, data protection, access control
2. **User Experience:** Intuitive interfaces, clear communication, self-service
3. **Admin Control:** Comprehensive management tools, detailed analytics
4. **Reliability:** Robust error handling, webhook processing, monitoring
5. **Performance:** Optimized queries, caching, React Query integration

Follow this blueprint sequentially, completing each phase before moving to the next. Test thoroughly at each stage and maintain comprehensive documentation throughout the implementation process.


