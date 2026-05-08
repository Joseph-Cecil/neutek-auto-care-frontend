'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Plus, Pencil, Trash2, Clock } from 'lucide-react';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import {
  useAdminServices, useAdminServiceCategories,
  useAdminCreateService, useAdminUpdateService, useAdminDeleteService,
} from '@/hooks/useAdminServices';
import { pesewasToGHS, ghsToPesewas, formatDuration } from '@/lib/utils/format';
import type { Service } from '@/lib/dto';

const serviceFormSchema = z.object({
  categoryId:               z.string().min(1, 'Category is required'),
  name:                     z.string().min(1, 'Name is required').max(200),
  description:              z.string().max(1000).optional(),
  basePriceGHS:             z.number().min(0, 'Price must be 0 or more'),
  estimatedDurationMinutes: z.number().int().min(1, 'Duration required'),
});
type ServiceFormData = z.infer<typeof serviceFormSchema>;

export default function AdminServicesPage() {
  const [showAdd,  setShowAdd]  = useState(false);
  const [editSvc,  setEditSvc]  = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: servicesData, isLoading } = useAdminServices({ limit: 100 });
  const { data: categories }              = useAdminServiceCategories();
  const { mutate: createService, isPending: creating } = useAdminCreateService();
  const { mutate: updateService, isPending: updating } = useAdminUpdateService();
  const { mutate: deleteService, isPending: deleting } = useAdminDeleteService();

  const services = servicesData?.data ?? [];

  function ServiceForm({
    defaultValues, onSubmit, isPending,
  }: {
    defaultValues?: Partial<ServiceFormData>;
    onSubmit: (data: ServiceFormData) => void;
    isPending: boolean;
  }) {
    const form = useForm<ServiceFormData>({
      resolver:      zodResolver(serviceFormSchema),
      defaultValues: {
        categoryId: '', name: '', description: '',
        basePriceGHS: 0, estimatedDurationMinutes: 60,
        ...defaultValues,
      },
    });

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="categoryId" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl><Input {...field} placeholder="e.g. Engine Diagnostic" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl><Input {...field} placeholder="Service description..." /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="basePriceGHS" render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price (GHS)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" step="0.01" min="0"
                    onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="estimatedDurationMinutes" render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="1"
                    onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <LoadingSpinner size="sm" className="mr-2" />}
              Save Service
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services"
        description={services.length + " services"}
        action={
          <Button onClick={() => setShowAdd(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        }
      />

      {isLoading ? (
        <SectionLoader />
      ) : services.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No services yet"
          action={{ label: 'Add Service', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditSvc(service)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteId(service.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">
                    {pesewasToGHS(service.base_price_pesewas)}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.estimated_duration_minutes)}
                  </div>
                </div>
                <div className="mt-2">
                  <span className={
                    "inline-flex rounded-full border px-2 py-0.5 text-xs " +
                    (service.is_active
                      ? "border-green-500/20 bg-green-500/10 text-green-400"
                      : "border-border text-muted-foreground")
                  }>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <ServiceForm
            onSubmit={(data) =>
              createService(
                {
                  categoryId:               data.categoryId,
                  name:                     data.name,
                  description:              data.description,
                  basePricePesewas:         ghsToPesewas(data.basePriceGHS),
                  estimatedDurationMinutes: data.estimatedDurationMinutes,
                },
                { onSuccess: () => setShowAdd(false) },
              )
            }
            isPending={creating}
          />
        </DialogContent>
      </Dialog>

      {/* Edit */}
      <Dialog open={!!editSvc} onOpenChange={(o) => !o && setEditSvc(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          {editSvc && (
            <ServiceForm
              defaultValues={{
                categoryId:               editSvc.category_id,
                name:                     editSvc.name,
                description:              editSvc.description ?? '',
                basePriceGHS:             editSvc.base_price_pesewas / 100,
                estimatedDurationMinutes: editSvc.estimated_duration_minutes,
              }}
              onSubmit={(data) =>
                updateService(
                  {
                    id:   editSvc.id,
                    body: {
                      categoryId:               data.categoryId,
                      name:                     data.name,
                      description:              data.description,
                      basePricePesewas:         ghsToPesewas(data.basePriceGHS),
                      estimatedDurationMinutes: data.estimatedDurationMinutes,
                    },
                  },
                  { onSuccess: () => setEditSvc(null) },
                )
              }
              isPending={updating}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Service"
        description="This will permanently delete the service. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deleteService(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isPending={deleting}
      />
    </div>
  );
}