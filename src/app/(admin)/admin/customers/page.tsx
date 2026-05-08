'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, Pencil, Trash2 } from 'lucide-react';
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
import { SearchInput }   from '@/components/admin/shared/SearchInput';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import {
  useCustomers, useCreateCustomer,
  useUpdateCustomer, useDeleteCustomer,
} from '@/hooks/useCustomers';
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer.schema';
import { fullName, formatPhone } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { Customer } from '@/lib/dto';

function CustomerForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  isPending: boolean;
}) {
  const form = useForm<CustomerFormData>({
    resolver:      zodResolver(customerSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', email: '', address: '', notes: '', ...defaultValues },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Phone</FormLabel>
            <FormControl><Input {...field} type="tel" placeholder="0XX XXX XXXX" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
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
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending && <LoadingSpinner size="sm" className="mr-2" />}
            Save Customer
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function AdminCustomersPage() {
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useCustomers({ search: search || undefined, page, limit: 20 });
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer();
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer();

  const customers  = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description={total + " total customers"}
        action={
          <Button onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />

      <SearchInput
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by name or phone..."
        className="max-w-sm"
      />

      {isLoading ? (
        <SectionLoader />
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No customers found"
          description={search ? 'No customers match your search.' : 'No customers yet.'}
          action={!search ? { label: 'Add Customer', onClick: () => setShowAdd(true) } : undefined}
        />
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {fullName(customer.first_name, customer.last_name)}
                    </p>
                    {customer.is_fleet_customer && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
                        Fleet
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>{formatPhone(customer.phone)}</span>
                    {customer.email && <span>{customer.email}</span>}
                    <span>Joined {formatDate(customer.created_at)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button size="sm" variant="ghost"
                    onClick={() => setEditCust(customer)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(customer.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <CustomerForm
            onSubmit={(data) => createCustomer(data, { onSuccess: () => setShowAdd(false) })}
            isPending={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editCust} onOpenChange={(o) => !o && setEditCust(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          {editCust && (
            <CustomerForm
              defaultValues={{
                firstName: editCust.first_name,
                lastName:  editCust.last_name,
                phone:     editCust.phone,
                email:     editCust.email ?? '',
                address:   editCust.address ?? '',
                notes:     editCust.notes ?? '',
              }}
              onSubmit={(data) =>
                updateCustomer(
                  { id: editCust.id, body: data },
                  { onSuccess: () => setEditCust(null) },
                )
              }
              isPending={updating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Customer"
        description="This will permanently delete the customer. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteCustomer(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isPending={deleting}
      />
    </div>
  );
}