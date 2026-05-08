import Link from 'next/link';
import { ChevronRight, Zap, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0F2044] to-[#0A1628]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,102,255,0.15),_transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              Ghana&apos;s Smart Auto Care Platform
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white lg:text-6xl lg:leading-tight">
            Smart Diagnostics.{' '}
            <span className="gradient-text">ECU Repair.</span>{' '}
            Complete Auto Care.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">
            Advanced vehicle diagnostics, car motherboard (ECU) repairs, maintenance,
            and digital service tracking — all in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/booking">
              <Button size="lg" className="gap-2 bg-primary px-8 text-white hover:bg-primary/90">
                Book a Service <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tracking">
              <Button size="lg" variant="outline"
                className="gap-2 border-white/20 px-8 text-white hover:bg-white/10">
                Track My Car
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-6">
            {[
              { Icon: Shield, label: 'Certified Technicians' },
              { Icon: Clock,  label: 'Fast Turnaround' },
              { Icon: Zap,    label: 'Digital Tracking' },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-white/50">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}