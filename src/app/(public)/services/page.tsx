'use client';

import Link from 'next/link';
import { WorkshopPhoto } from '@/components/media/WorkshopPhoto';
import { TopProgress } from '@/components/ui/top-progress';
import { useServices, useServiceCategories } from '@/hooks/useServices';

export default function ServicesPage() {
  const categories = useServiceCategories();
  const services = useServices({ active: true, limit: 100 });
  const rows = services.data?.data ?? [];
  const groups = (categories.data ?? [])
    .map((category) => ({
      category,
      items: rows.filter((service) => service.category_id === category.id),
    }))
    .filter((group) => group.items.length > 0);
  const ungrouped = rows.filter((service) => !groups.some((group) => group.items.includes(service)));
  const failed = (services.isError && !services.data) || (categories.isError && !categories.data);

  return (
    <div className="pubwrap">
      <TopProgress active={services.isLoading || categories.isLoading} />
      <section className="sec">
        <WorkshopPhoto
          image="wheelAssist"
          style={{ minHeight: 280, marginBottom: 28 }}
          caption="Book a service, then approve the quote"
          priority
        />
        <h1 style={{ fontSize: 36 }}>Services</h1>
        <p className="muted" style={{ margin: '8px 0 32px' }}>
          Choose what you need. Pricing is quoted after inspection, and nothing starts until you approve.
        </p>
        {failed ? (
          <div className="banner" role="alert">Could not load services. Refresh the page and try again.</div>
        ) : services.isLoading ? (
          <p className="muted">Loading services.</p>
        ) : rows.length === 0 ? (
          <div className="card"><div className="empty"><h2>No services yet</h2><p className="muted">The catalogue is empty.</p></div></div>
        ) : (
          <div className="stack">
            {groups.map((group) => (
              <div key={group.category.id} className="stack s">
                <h2>{group.category.name}</h2>
                {group.items.map((service) => (
                  <div key={service.id} className="pcard">
                    <div style={{ maxWidth: '52ch' }}>
                      <div className="b">{service.name}</div>
                      {service.description ? <div className="muted sm">{service.description}</div> : null}
                    </div>
                    <div className="row">
                      <span className="pill">Quote after inspection</span>
                      <Link href={`/booking?service=${service.id}`} className="btn sm">Book</Link>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {ungrouped.length > 0 ? (
              <div className="stack s">
                <h2>Other</h2>
                {ungrouped.map((service) => (
                  <div key={service.id} className="pcard">
                    <div className="b">{service.name}</div>
                    <Link href={`/booking?service=${service.id}`} className="btn sm">Book</Link>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
