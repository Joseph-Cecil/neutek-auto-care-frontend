'use client';

import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import {
  useAdminServices,
  useAdminServiceCategories,
  useAdminCreateService,
  useAdminUpdateService,
} from '@/hooks/useAdminServices';
import { ghsAmount, ghsToPesewas, formatDuration } from '@/lib/utils/format';
import type { Service } from '@/lib/dto';

const serviceFormSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional(),
  basePriceGHS: z.number().min(0, 'Price must be 0 or more'),
  estimatedDurationMinutes: z.number().int().min(1, 'Duration required'),
});
type ServiceFormData = z.infer<typeof serviceFormSchema>;

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="scrim" onMouseDown={onClose}>
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="row sb">
          <h2 id="dlg-title">{title}</h2>
          <button type="button" className="btn ghost sm" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ServiceForm({
  categories,
  defaultValues,
  onSubmit,
  isPending,
}: {
  categories: Array<{ id: string; name: string }>;
  defaultValues?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => void;
  isPending: boolean;
}) {
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      description: '',
      basePriceGHS: 0,
      estimatedDurationMinutes: 60,
      ...defaultValues,
    },
  });
  const messages = Object.values(form.formState.errors).map((error) => error?.message).filter(Boolean) as string[];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="stack s" noValidate>
      {messages.length > 0 ? (
        <div className="errsum" role="alert">
          <b>Fix these fields</b>
          <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="sv-cat">Category</label>
        <select id="sv-cat" className={form.formState.errors.categoryId ? 'input err' : 'input'} {...form.register('categoryId')}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {form.formState.errors.categoryId ? <span className="hint err">{form.formState.errors.categoryId.message}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="sv-name">Service name</label>
        <input id="sv-name" className={form.formState.errors.name ? 'input err' : 'input'} placeholder="Engine diagnostic" {...form.register('name')} />
        {form.formState.errors.name ? <span className="hint err">{form.formState.errors.name.message}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="sv-desc">Description <span className="faint">(optional)</span></label>
        <textarea id="sv-desc" className="input" placeholder="Service description" {...form.register('description')} />
      </div>
      <div className="grid g2">
        <div className="field">
          <label htmlFor="sv-price">Base price (GHS)</label>
          <input
            id="sv-price"
            className={form.formState.errors.basePriceGHS ? 'input err' : 'input'}
            type="number"
            step="0.01"
            min="0"
            {...form.register('basePriceGHS', { valueAsNumber: true })}
          />
          {form.formState.errors.basePriceGHS ? <span className="hint err">{form.formState.errors.basePriceGHS.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="sv-mins">Duration (minutes)</label>
          <input
            id="sv-mins"
            className={form.formState.errors.estimatedDurationMinutes ? 'input err' : 'input'}
            type="number"
            min="1"
            {...form.register('estimatedDurationMinutes', { valueAsNumber: true })}
          />
          {form.formState.errors.estimatedDurationMinutes ? <span className="hint err">{form.formState.errors.estimatedDurationMinutes.message}</span> : null}
        </div>
      </div>
      <div className="row end">
        <button
          type="submit"
          className={isPending ? 'btn primary nt-loading' : 'btn primary'}
          data-variant="primary"
          disabled={isPending}
        >
          Save service
        </button>
      </div>
    </form>
  );
}

export default function AdminServicesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editSvc, setEditSvc] = useState<Service | null>(null);
  const [askId, setAskId] = useState<string | null>(null);

  const { data: servicesData, isLoading, isError, isFetching } = useAdminServices({ limit: 100 });
  const categoriesQuery = useAdminServiceCategories();
  const { mutate: createService, isPending: creating } = useAdminCreateService();
  const { mutate: updateService, isPending: updating } = useAdminUpdateService();

  const services = servicesData?.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const counts = new Map<string, number>();
  for (const service of services) {
    counts.set(service.category_id, (counts.get(service.category_id) ?? 0) + 1);
  }

  const setActive = (service: Service, isActive: boolean) => {
    updateService(
      { id: service.id, body: { isActive } },
      { onSuccess: () => setAskId(null) },
    );
  };

  if (isLoading) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  return (
    <div className="stack">
      <TopProgress active={isFetching || creating || updating || categoriesQuery.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Services</h1>
          <p className="muted">What customers can book, and what it costs.</p>
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>Add service</button>
        </div>
      </div>
      {isError && !servicesData ? (
        <div className="banner" role="alert">Failed to load services. Please refresh the page.</div>
      ) : null}
      {categoriesQuery.isError && !categoriesQuery.data ? (
        <div className="banner" role="alert">Could not load categories.</div>
      ) : null}
      {!isError && services.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No services yet</h2>
            <button type="button" className="btn" onClick={() => setShowAdd(true)}>Add service</button>
          </div>
        </div>
      ) : null}
      {services.length > 0 ? (
        <div className="stack">
          {categories.length > 0 ? (
            <div className="card">
              <h2>Categories</h2>
              <div className="stack s" style={{ marginTop: 12 }}>
                {categories.map((category) => (
                  <div key={category.id} className="row sb">
                    <span>{category.name}</span>
                    <span className="faint sm">{counts.get(category.id) ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="card flush">
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="num">Price</th>
                    <th className="num">Duration</th>
                    <th>Status</th>
                    <th><span className="sr">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => {
                    const asking = askId === service.id;
                    const categoryName = categories.find((category) => category.id === service.category_id)?.name ?? '—';
                    return (
                      <tr key={service.id}>
                        <td>
                          <div className="two">
                            <span className="b">{service.name}</span>
                            {service.description ? <span>{service.description}</span> : null}
                          </div>
                        </td>
                        <td>{categoryName}</td>
                        <td className="num">GHS {ghsAmount(service.base_price_pesewas)}</td>
                        <td className="num">{formatDuration(service.estimated_duration_minutes)}</td>
                        <td>
                          <span className={service.is_active ? 'pill ok' : 'pill'}>{service.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td>
                          {asking ? (
                            <div className="row">
                              <span className="b">Deactivate {service.name}?</span>
                              <button type="button" className="btn sm" onClick={() => setAskId(null)}>Keep active</button>
                              <button
                                type="button"
                                className={updating ? 'btn sm danger nt-loading' : 'btn sm danger'}
                                data-variant="danger"
                                disabled={updating}
                                onClick={() => setActive(service, false)}
                              >
                                Deactivate
                              </button>
                            </div>
                          ) : service.is_active ? (
                            <div className="row">
                              <button type="button" className="btn sm" onClick={() => setEditSvc(service)}>Edit</button>
                              <button type="button" className="btn sm danger" onClick={() => setAskId(service.id)}>Deactivate</button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className={updating ? 'btn sm nt-loading' : 'btn sm'}
                              disabled={updating}
                              onClick={() => setActive(service, true)}
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
      {showAdd ? (
        <Dialog title="Add service" onClose={() => setShowAdd(false)}>
          <ServiceForm
            categories={categories}
            onSubmit={(formData) => createService(
              {
                categoryId: formData.categoryId,
                name: formData.name,
                description: formData.description,
                basePricePesewas: ghsToPesewas(formData.basePriceGHS),
                estimatedDurationMinutes: formData.estimatedDurationMinutes,
              },
              { onSuccess: () => setShowAdd(false) },
            )}
            isPending={creating}
          />
        </Dialog>
      ) : null}
      {editSvc ? (
        <Dialog title="Edit service" onClose={() => setEditSvc(null)}>
          <ServiceForm
            key={editSvc.id}
            categories={categories}
            defaultValues={{
              categoryId: editSvc.category_id,
              name: editSvc.name,
              description: editSvc.description ?? '',
              basePriceGHS: editSvc.base_price_pesewas / 100,
              estimatedDurationMinutes: editSvc.estimated_duration_minutes,
            }}
            onSubmit={(formData) => updateService(
              {
                id: editSvc.id,
                body: {
                  categoryId: formData.categoryId,
                  name: formData.name,
                  description: formData.description,
                  basePricePesewas: ghsToPesewas(formData.basePriceGHS),
                  estimatedDurationMinutes: formData.estimatedDurationMinutes,
                },
              },
              { onSuccess: () => setEditSvc(null) },
            )}
            isPending={updating}
          />
        </Dialog>
      ) : null}
    </div>
  );
}
