'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { useServices, useServiceCategories } from '@/hooks/useServices';
import { pesewasToGHS, formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: categories } = useServiceCategories();
  const { data, isLoading }  = useServices({
    categoryId: selectedCategory,
    active:     true,
    limit:      50,
  });

  const services = data?.data ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white lg:text-5xl">Our Services</h1>
        <p className="mt-4 text-white/50 max-w-xl mx-auto">
          Professional automotive care for every make and model.
          Transparent pricing, certified technicians.
        </p>
      </div>

      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              !selectedCategory
                ? 'border-primary bg-primary text-white'
                : 'border-white/20 text-white/60 hover:border-primary/50 hover:text-white',
            )}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/20 text-white/60 hover:border-primary/50 hover:text-white',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Services grid */}
      {isLoading ? (
        <SectionLoader />
      ) : services.length === 0 ? (
        <div className="py-16 text-center text-white/40">No services found</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div key={service.id}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-primary/40 hover:bg-white/8">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">{service.name}</h3>
                {service.description && (
                  <p className="mt-2 text-sm text-white/50 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-primary">
                    {pesewasToGHS(service.base_price_pesewas)}
                  </p>
                  <p className="text-xs text-white/40">Starting price</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/40">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDuration(service.estimated_duration_minutes)}
                </div>
              </div>
              <Link href={"/booking?service=" + service.id} className="mt-4">
                <Button className="w-full gap-1.5 group-hover:bg-primary" variant="outline"
                  size="sm">
                  Book Now <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}