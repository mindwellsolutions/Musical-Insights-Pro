import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/stripe-client';

/**
 * GET /api/invoices/download-invoice/[invoiceId]
 * Generate download link for invoice PDF
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceId: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { invoiceId } = await params;

    // Verify invoice belongs to user
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single();

    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // If PDF URL is already stored, return it
    if (invoice.invoice_pdf) {
      return NextResponse.json({
        url: invoice.invoice_pdf,
      });
    }

    // Otherwise, retrieve from Stripe
    const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);

    if (!stripeInvoice.invoice_pdf) {
      return NextResponse.json(
        { error: 'Invoice PDF not available' },
        { status: 404 }
      );
    }

    // Update database with PDF URL
    await supabase
      .from('invoices')
      .update({ invoice_pdf: stripeInvoice.invoice_pdf })
      .eq('id', invoiceId);

    return NextResponse.json({
      url: stripeInvoice.invoice_pdf,
    });
  } catch (error: any) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to download invoice' },
      { status: 500 }
    );
  }
}

