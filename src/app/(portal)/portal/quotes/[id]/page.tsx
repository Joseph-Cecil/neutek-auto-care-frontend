'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle,
  FileText, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useQuote, useApproveQuote, useRejectQuote } from '@/hooks/useQuotes';
import { pesewasToGHS } from '@/lib/utils/format';
import { formatDate, daysUntil } from '@/lib/utils/date';

export default function PortalQuoteDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const { data: quote, isLoading, error } = useQuote(id);
  const { mutate: approveQuote, isPending: approving } = useApproveQuote();
  const { mutate: rejectQuote,  isPending: rejecting }  = useRejectQuote();

  const [showReject,   setShowReject]   = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (isLoading) return <SectionLoader />;

  if (error || !quote) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Quote not found</h2>
        <Link href="/portal/quotes">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Quotes
          </Button>
        </Link>
      </div>
    );
  }

  const canAct  = quote.status === 'sent';
  const daysLeft = daysUntil(quote.valid_until);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/portal/quotes">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Quotes
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{quote.quote_number}</p>
          <h1 className="mt-1 text-xl font-bold">Repair Quote</h1>
        </div>
        <StatusBadge
          label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          variant={
            quote.status === 'approved' ? 'success' :
            quote.status === 'rejected' ? 'danger'  :
            quote.status === 'sent'     ? 'info'    : 'muted'
          }
        />
      </div>

      {/* Validity warning */}
      {canAct && (
        <div className={
          "flex items-center gap-2 rounded-lg border p-3 text-sm " +
          (daysLeft <= 1
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-amber-500/30 bg-amber-500/10 text-amber-500")
        }>
          <Clock className="h-4 w-4 shrink-0" />
          {daysLeft <= 0
            ? "This quote expires today!"
            : daysLeft === 1
            ? "This quote expires tomorrow!"
            : "Valid for " + daysLeft + " more day" + (daysLeft !== 1 ? 's' : '')}
        </div>
      )}

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" /> Services & Parts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* We display totals since line items need a separate endpoint */}
            <div className="space-y-2 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{pesewasToGHS(quote.subtotal_pesewas)}</span>
              </div>
              {quote.tax_pesewas > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{pesewasToGHS(quote.tax_pesewas)}</span>
                </div>
              )}
              {quote.discount_pesewas > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount</span>
                  <span>- {pesewasToGHS(quote.discount_pesewas)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Total</span>
                <span className="text-primary">{pesewasToGHS(quote.total_pesewas)}</span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-1 font-medium">Notes from technician</p>
              <p className="text-muted-foreground">{quote.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {canAct && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => approveQuote(id)}
            disabled={approving || rejecting}
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
          >
            {approving
              ? <LoadingSpinner size="sm" className="mr-1" />
              : <CheckCircle className="h-4 w-4" />}
            Approve Quote
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReject(true)}
            disabled={approving || rejecting}
            className="flex-1 gap-2 text-destructive hover:bg-destructive/10"
          >
            <XCircle className="h-4 w-4" /> Reject Quote
          </Button>
        </div>
      )}

      {quote.status === 'approved' && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            You approved this quote. Repair work is in progress.
          </p>
        </div>
      )}

      {quote.status === 'rejected' && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <XCircle className="h-5 w-5" />
          <p className="text-sm font-medium">You rejected this quote.</p>
        </div>
      )}

      {/* Reject dialog */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>
              You can optionally provide a reason for rejecting this quote.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (optional)..."
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={rejecting}
              onClick={() => {
                rejectQuote(
                  { id, body: rejectReason ? { reason: rejectReason } : undefined },
                  { onSuccess: () => setShowReject(false) },
                );
              }}
            >
              {rejecting && <LoadingSpinner size="sm" className="mr-2" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}