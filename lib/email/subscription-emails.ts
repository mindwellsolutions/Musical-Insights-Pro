/**
 * Subscription Email Service
 * 
 * This module provides email notification functions for subscription events.
 * 
 * SETUP REQUIRED:
 * 1. Choose an email service provider (Resend, SendGrid, etc.)
 * 2. Install the provider's SDK: npm install resend (or your chosen provider)
 * 3. Add API key to .env.local: EMAIL_API_KEY=your_key_here
 * 4. Uncomment and configure the email client below
 * 5. Create email templates in the templates directory
 * 
 * Example with Resend:
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.EMAIL_API_KEY);
 */

interface EmailUser {
  id: string;
  email: string;
  name?: string;
}

interface Subscription {
  planName: string;
  planPrice: number;
  interval: string;
  currentPeriodEnd: string;
}

interface Invoice {
  invoiceNumber: string;
  amountPaid: number;
  currency: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
}

/**
 * Send welcome email when user subscribes
 */
export async function sendWelcomeEmail(user: EmailUser, subscription: Subscription) {
  console.log('📧 [EMAIL] Welcome email would be sent to:', user.email);
  console.log('Plan:', subscription.planName);
  
  // TODO: Implement actual email sending
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'Musical Insights <noreply@musicalinsights.com>',
  //   to: user.email,
  //   subject: 'Welcome to Musical Insights Premium!',
  //   html: welcomeEmailTemplate(user, subscription),
  // });
}

/**
 * Send email when trial starts
 */
export async function sendTrialStartedEmail(user: EmailUser, trialEnd: Date) {
  console.log('📧 [EMAIL] Trial started email would be sent to:', user.email);
  console.log('Trial ends:', trialEnd);
  
  // TODO: Implement actual email sending
}

/**
 * Send reminder email 3 days before trial ends
 */
export async function sendTrialEndingEmail(user: EmailUser, daysRemaining: number) {
  console.log('📧 [EMAIL] Trial ending email would be sent to:', user.email);
  console.log('Days remaining:', daysRemaining);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when payment succeeds
 */
export async function sendPaymentSuccessEmail(user: EmailUser, invoice: Invoice) {
  console.log('📧 [EMAIL] Payment success email would be sent to:', user.email);
  console.log('Invoice:', invoice.invoiceNumber);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when payment fails
 */
export async function sendPaymentFailedEmail(user: EmailUser, invoice: Invoice) {
  console.log('📧 [EMAIL] Payment failed email would be sent to:', user.email);
  console.log('Invoice:', invoice.invoiceNumber);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when subscription is renewed
 */
export async function sendSubscriptionRenewedEmail(user: EmailUser, invoice: Invoice) {
  console.log('📧 [EMAIL] Subscription renewed email would be sent to:', user.email);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when subscription is canceled
 */
export async function sendSubscriptionCanceledEmail(user: EmailUser, accessEnd: Date) {
  console.log('📧 [EMAIL] Subscription canceled email would be sent to:', user.email);
  console.log('Access until:', accessEnd);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when subscription is reactivated
 */
export async function sendSubscriptionReactivatedEmail(user: EmailUser, subscription: Subscription) {
  console.log('📧 [EMAIL] Subscription reactivated email would be sent to:', user.email);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when plan is changed
 */
export async function sendPlanChangedEmail(user: EmailUser, oldPlan: string, newPlan: string) {
  console.log('📧 [EMAIL] Plan changed email would be sent to:', user.email);
  console.log('From:', oldPlan, 'To:', newPlan);
  
  // TODO: Implement actual email sending
}

/**
 * Send email when refund is processed
 */
export async function sendRefundProcessedEmail(user: EmailUser, invoice: Invoice, amount: number) {
  console.log('📧 [EMAIL] Refund processed email would be sent to:', user.email);
  console.log('Amount:', amount);
  
  // TODO: Implement actual email sending
}

