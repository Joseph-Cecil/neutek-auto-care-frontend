'use client';

import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { useServices } from '@/hooks/useServices';
import { pesewasToGHS, formatDuration } from '@/lib/utils/format';

export function ServicesPreview() {
  const { data, isLoading, error } = useServices({ active: true, limit: 6 });
  const services = data?.data ?? [];

  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-bold text-white lg:text-4xl">Our Services</h2>
            <p className="mt-2 text-white/50">Professional automotive care for every need</p>
          </div>
          <Link href="/services">
            <Button variant="outline"
              className="gap-1.5 border-white/20 text-white hover:bg-white/10">
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <SectionLoader />
        ) : error ? (
          <p className="py-8 text-center text-white/50">Could not load services. Please try again later.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.id}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:border-primary/30">
                <h3 className="font-semibold text-white">{service.name}</h3>
                {service.description && (
                  <p className="mt-1 text-sm text-white/50 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-primary">
                      {pesewasToGHS(service.base_price_pesewas)}
                    </p>
                    <p className="text-xs text-white/40">Starting price</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/40">
                    <Clock className="h-3 w-3" />
                    {formatDuration(service.estimated_duration_minutes)}
                  </div>
                </div>
                <Link href={"/booking?service=" + service.id} className="mt-4 block">
                  <Button size="sm" variant="outline"
                    className="w-full border-white/20 text-white hover:bg-primary hover:border-primary">
                    Book Now
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}