'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { Pagination }    from '@/components/shared/Pagination';
import { useAdminPayments, useRecordPayment } from '@/hooks/useAdminPayments';
import { pesewasToGHS, ghsToPesewas } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import type { PaymentStatus } from '@/lib/dto';

const recordSchema = z.object({
  invoiceId:        z.string().min(1, 'Invoice ID required'),
  amountGHS:        z.number().positive('Amount must be positive'),
  method:           z.enum(['cash', 'card', 'bank_transfer', 'mobile_money', 'online']),
  gatewayReference: z.string().optional(),
});
type RecordFormData = z.infer<typeof recordSchema>;

const STATUS_VARIANT: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  pending:   'warning',
  completed: 'success',
  failed:    'danger',
  refunded:  'muted',
};

export default function AdminPaymentsPage() {
  const [page,       setPage]       = useState(1);
  const [showRecord, setShowRecord] = useState(false);

  const { data, isLoading, error } = useAdminPayments({ page, limit: 20 });
  const { mutate: recordPayment, isPending: recording } = useRecordPayment();

  const payments   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  const form = useForm<RecordFormData>({
    resolver:      zodResolver(recordSchema),
    defaultValues: { invoiceId: '', amountGHS: 0, method: 'cash' },
  });

  const onSubmit = (data: RecordFormData) => {
    recordPayment(
      {
        invoiceId:        data.invoiceId,
        amountPesewas:    ghsToPesewas(data.amountGHS),
        method:           data.method,
        gatewayReference: data.gatewayReference || undefined,
      },
      { onSuccess: () => { setShowRecord(false); form.reset(); } },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description={total + " total payments"}
        action={
          <Button onClick={() => setShowRecord(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Record Payment
          </Button>
        }
      />

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load payments. Please refresh the page." />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="No payments yet"
        />
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {payment.payment_reference}
                    </span>
                    <StatusBadge
                      label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      variant={STATUS_VARIANT[payment.status]}
                    />
                    <span className="rounded-full border border-border px-2 py-0.5 text-xs capitalize text-muted-foreground">
                      {payment.method.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {pesewasToGHS(payment.amount_pesewas)}
                    </span>
                    <span>{formatDateTime(payment.created_at)}</span>
                    {payment.gateway_reference && (
                      <span className="font-mono">{payment.gateway_reference}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Record payment dialog */}
      <Dialog open={showRecord} onOpenChange={setShowRecord}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Offline Payment</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="invoiceId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="UUID" className="font-mono text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amountGHS" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (GHS)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0.01" placeholder="0.00"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="method" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gatewayReference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Transaction reference..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowRecord(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={recording}>
                  {recording && <LoadingSpinner size="sm" className="mr-2" />}
                  Record Payment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}