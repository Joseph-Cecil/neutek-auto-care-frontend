import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <h2 className="text-3xl font-bold text-white lg:text-5xl">
          Your Car Deserves{' '}
          <span className="gradient-text">Smart Care</span>
        </h2>
        <p className="mt-4 text-white/50 max-w-lg mx-auto">
          Join thousands of Ghanaian car owners who trust Neutek for diagnostics,
          ECU repair, and complete vehicle maintenance.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/booking">
            <Button size="lg" className="gap-2 px-10 bg-primary hover:bg-primary/90">
              Book Service Today <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="https://wa.me/233XXXXXXXXX" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline"
              className="gap-2 border-white/20 text-white hover:bg-white/10 px-8">
              WhatsApp Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}