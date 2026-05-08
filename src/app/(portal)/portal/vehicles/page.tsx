'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState }    from '@/components/shared/EmptyState';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  useCustomerVehicles, useCreateVehicle,
  useUpdateVehicle, useDeleteVehicle,
} from '@/hooks/useVehicles';
import { useAuthStore } from '@/stores/auth.store';
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle.schema';
import { APP_CONSTANTS } from '@/config/constants';
import type { Vehicle } from '@/lib/dto';

function VehicleForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void;
  isPending: boolean;
}) {
  const currentYear = new Date().getFullYear();

  const form = useForm<VehicleFormData>({
    resolver:      zodResolver(vehicleSchema),
    defaultValues: {
      make: '', model: '', year: currentYear,
      licensePlate: '', vin: '', color: '', notes: '',
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="make" render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Toyota" list="brands-list" />
              </FormControl>
              <datalist id="brands-list">
                {APP_CONSTANTS.VEHICLE_BRANDS.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="model" render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl><Input {...field} placeholder="Camry" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="year" render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input {...field} type="number"
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  min={1900} max={currentYear + 1} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="licensePlate" render={({ field }) => (
            <FormItem>
              <FormLabel>License Plate</FormLabel>
              <FormControl>
                <Input {...field} placeholder="GR-1234-23"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="color" render={({ field }) => (
            <FormItem>
              <FormLabel>Color <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl><Input {...field} placeholder="Silver" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="mileage" render={({ field }) => (
            <FormItem>
              <FormLabel>Mileage <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl>
                <Input {...field} type="number" placeholder="50000"
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="vin" render={({ field }) => (
          <FormItem>
            <FormLabel>VIN <span className="text-muted-foreground">(optional, 17 chars)</span></FormLabel>
            <FormControl>
              <Input {...field} placeholder="1HGBH41JXMN109186" maxLength={17}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
            <FormControl><Input {...field} placeholder="Any additional info..." /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <DialogFooter>
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending && <LoadingSpinner size="sm" className="mr-2" />}
            Save Vehicle
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default function PortalVehiclesPage() {
  const user       = useAuthStore((s) => s.user);
  const customerId = user?.id ?? '';

  const { data: vehicles, isLoading } = useCustomerVehicles(customerId);
  const { mutate: createVehicle, isPending: creating } = useCreateVehicle(customerId);
  const { mutate: updateVehicle, isPending: updating } = useUpdateVehicle(customerId);
  const { mutate: deleteVehicle, isPending: deleting } = useDeleteVehicle(customerId);

  const [showAdd,     setShowAdd]     = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteId,    setDeleteId]    = useState<string | null>(null);

  const handleCreate = (data: VehicleFormData) => {
    createVehicle(
      { ...data, customerId, vin: data.vin || undefined },
      { onSuccess: () => setShowAdd(false) },
    );
  };

  const handleUpdate = (data: VehicleFormData) => {
    if (!editVehicle) return;
    updateVehicle(
      { id: editVehicle.id, body: { ...data, vin: data.vin || undefined } },
      { onSuccess: () => setEditVehicle(null) },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">My Vehicles</h1>
          <p className="mt-1 text-muted-foreground">Manage your registered vehicles</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : !vehicles || vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="h-6 w-6" />}
          title="No vehicles yet"
          description="Add your vehicle to start tracking repairs and booking services."
          action={{ label: 'Add Vehicle', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="group relative">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car className="h-4 w-4 text-primary" />
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Plate</span>
                  <span className="font-mono font-medium">{vehicle.license_plate}</span>
                </div>
                {vehicle.color && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Color</span>
                    <span>{vehicle.color}</span>
                  </div>
                )}
                {vehicle.mileage && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mileage</span>
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                )}
                {vehicle.vin && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">VIN</span>
                    <span className="font-mono text-xs">{vehicle.vin}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-3">
                  <Button size="sm" variant="outline" className="flex-1 gap-1"
                    onClick={() => setEditVehicle(vehicle)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="outline"
                    className="gap-1 text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(vehicle.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <VehicleForm onSubmit={handleCreate} isPending={creating} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editVehicle} onOpenChange={(o) => !o && setEditVehicle(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          {editVehicle && (
            <VehicleForm
              defaultValues={{
                make:         editVehicle.make,
                model:        editVehicle.model,
                year:         editVehicle.year,
                licensePlate: editVehicle.license_plate,
                vin:          editVehicle.vin ?? '',
                color:        editVehicle.color ?? '',
                mileage:      editVehicle.mileage ?? undefined,
                notes:        editVehicle.notes ?? '',
              }}
              onSubmit={handleUpdate}
              isPending={updating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove Vehicle"
        description="Are you sure you want to remove this vehicle? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) {
            deleteVehicle(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        isPending={deleting}
      />
    </div>
  );
}