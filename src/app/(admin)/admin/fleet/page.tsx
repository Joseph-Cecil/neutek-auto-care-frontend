'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, ChevronRight } from 'lucide-react';
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
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import { useFleetAccounts, useCreateFleetAccount } from '@/hooks/useFleet';
import { pesewasToGHS, ghsToPesewas, formatPhone } from '@/lib/utils/format';

const fleetSchema = z.object({
  companyName:       z.string().min(1, 'Company name required'),
  contactName:       z.string().min(1, 'Contact name required'),
  phone:             z.string().min(9).max(20),
  email:             z.string().email().optional().or(z.literal('')),
  address:           z.string().max(500).optional(),
  creditLimitGHS:    z.number().min(0).default(0),
});
type FleetFormData = z.infer<typeof fleetSchema>;

export default function AdminFleetPage() {
  const [page,    setPage]    = useState(1);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useFleetAccounts({ page, limit: 20 });
  const { mutate: createAccount, isPending: creating } = useCreateFleetAccount();

  const accounts   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  const form = useForm<FleetFormData>({
    resolver:      zodResolver(fleetSchema),
    defaultValues: {
      companyName: '', contactName: '', phone: '',
      email: '', address: '', creditLimitGHS: 0,
    },
  });

  const onSubmit = (data: FleetFormData) => {
    createAccount(
      {
        companyName:       data.companyName,
        contactName:       data.contactName,
        phone:             data.phone,
        email:             data.email || undefined,
        address:           data.address || undefined,
        creditLimitPesewas: ghsToPesewas(data.creditLimitGHS),
      },
      { onSuccess: () => { setShowAdd(false); form.reset(); } },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fleet Accounts"
        description={total + " accounts"}
        action={
          <Button onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Fleet Account
          </Button>
        }
      />

      {isLoading ? (
        <SectionLoader />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No fleet accounts yet"
          action={{ label: 'Add Fleet Account', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Link key={account.id} href={"/admin/fleet/" + account.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{account.company_name}</p>
                      <span className={
                        "inline-flex rounded-full border px-2 py-0.5 text-xs " +
                        (account.is_active
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : "border-border text-muted-foreground")
                      }>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{account.contact_name}</span>
                      <span>{formatPhone(account.phone)}</span>
                      <span>Credit limit: {pesewasToGHS(account.credit_limit_pesewas)}</span>
                      <span className={
                        account.outstanding_balance_pesewas > 0
                          ? "text-amber-400"
                          : "text-muted-foreground"
                      }>
                        Balance: {pesewasToGHS(account.outstanding_balance_pesewas)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add fleet dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Fleet Account</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl><Input {...field} placeholder="Acme Transport Ltd." /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="contactName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl><Input {...field} placeholder="John Doe" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} type="tel" placeholder="0XX XXX XXXX" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input {...field} type="email" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="creditLimitGHS" render={({ field }) => (
                <FormItem>
                  <FormLabel>Credit Limit (GHS)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" step="0.01"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <LoadingSpinner size="sm" className="mr-2" />}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}