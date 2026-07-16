import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/invoices/get-invoices
 * Retrieve user's billing history with pagination
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('invoices')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('Error fetching invoices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    // Format invoices
    const formattedInvoices = (invoices || []).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      stripeInvoiceId: invoice.stripe_invoice_id,
      amountDue: parseFloat(invoice.amount_due),
      amountPaid: parseFloat(invoice.amount_paid),
      currency: invoice.currency,
      status: invoice.status,
      dueDate: invoice.due_date,
      paidAt: invoice.paid_at,
      invoicePdf: invoice.invoice_pdf,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      billingReason: invoice.billing_reason,
      periodStart: invoice.period_start,
      periodEnd: invoice.period_end,
      createdAt: invoice.created_at,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    });
  } catch (error) {
    console.error('Unexpected error in get-invoices:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

