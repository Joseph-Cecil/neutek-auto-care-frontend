'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Car, Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { useFleetAccount, useFleetVehicles, useAddFleetVehicle } from '@/hooks/useFleet';
import { pesewasToGHS, formatPhone } from '@/lib/utils/format';

const addVehicleSchema = z.object({
  vehicleId:   z.string().min(1, 'Vehicle ID required'),
  driverName:  z.string().optional(),
  driverPhone: z.string().min(9).max(20).optional().or(z.literal('')),
  notes:       z.string().optional(),
});
type AddVehicleFormData = z.infer<typeof addVehicleSchema>;

export default function AdminFleetDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const [showAdd, setShowAdd] = useState(false);

  const { data: account,  isLoading: accountLoading, error } = useFleetAccount(id);
  const { data: vehicles, isLoading: vehiclesLoading }        = useFleetVehicles(id);
  const { mutate: addVehicle, isPending: adding }              = useAddFleetVehicle(id);

  const form = useForm<AddVehicleFormData>({
    resolver:      zodResolver(addVehicleSchema),
    defaultValues: { vehicleId: '', driverName: '', driverPhone: '', notes: '' },
  });

  const onSubmit = (data: AddVehicleFormData) => {
    addVehicle(
      {
        vehicleId:   data.vehicleId,
        driverName:  data.driverName || undefined,
        driverPhone: data.driverPhone || undefined,
        notes:       data.notes || undefined,
      },
      { onSuccess: () => { setShowAdd(false); form.reset(); } },
    );
  };

  if (accountLoading) return <SectionLoader />;

  if (error || !account) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Fleet account not found</h2>
        <Link href="/admin/fleet">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Fleet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/fleet">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Fleet
        </Button>
      </Link>

      {/* Account summary */}
      <div>
        <h1 className="text-2xl font-bold">{account.company_name}</h1>
        <p className="mt-1 text-muted-foreground">{account.contact_name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Contact', value: formatPhone(account.phone) },
          { label: 'Email',   value: account.email ?? '—' },
          { label: 'Credit Limit', value: pesewasToGHS(account.credit_limit_pesewas) },
          {
            label: 'Outstanding',
            value: pesewasToGHS(account.outstanding_balance_pesewas),
            highlight: account.outstanding_balance_pesewas > 0,
          },
        ].map(({ label, value, highlight }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={
                "mt-1 font-semibold " +
                (highlight ? "text-amber-400" : "text-foreground")
              }>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fleet vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Car className="h-4 w-4 text-primary" /> Fleet Vehicles
          </CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Vehicle
          </Button>
        </CardHeader>
        <CardContent>
          {vehiclesLoading ? (
            <SectionLoader />
          ) : !vehicles || vehicles.length === 0 ? (
            <EmptyState
              icon={<Car className="h-6 w-6" />}
              title="No vehicles yet"
              description="Add existing vehicles to this fleet account."
              action={{ label: 'Add Vehicle', onClick: () => setShowAdd(true) }}
            />
          ) : (
            <div className="space-y-2">
              {vehicles.map((v) => (
                <div key={v.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-mono font-medium text-xs text-muted-foreground">
                      Vehicle ID: {v.vehicle_id}
                    </p>
                    {v.driver_name && (
                      <p className="mt-0.5 text-muted-foreground">
                        Driver: {v.driver_name}
                        {v.driver_phone && " · " + formatPhone(v.driver_phone)}
                      </p>
                    )}
                    {v.notes && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{v.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add vehicle dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle to Fleet</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="vehicleId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle ID (UUID)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Existing vehicle UUID"
                      className="font-mono text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="driverName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input {...field} placeholder="John Driver" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="driverPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Phone <span className="text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl><Input {...field} type="tel" placeholder="0XX XXX XXXX" /></FormControl>
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
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding && <LoadingSpinner size="sm" className="mr-2" />}
                  Add Vehicle
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}