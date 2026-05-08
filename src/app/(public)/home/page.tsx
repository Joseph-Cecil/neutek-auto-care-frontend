'use client';

import { HeroSection }         from '@/components/public/home/HeroSection';
import { WhyChooseUs }         from '@/components/public/home/WhyChooseUs';
import { ServicesPreview }     from '@/components/public/home/ServicesPreview';
import { HowItWorks }          from '@/components/public/home/HowItWorks';
import { TrackingCTA }         from '@/components/public/home/TrackingCTA';
import { BrandsSection }       from '@/components/public/home/BrandsSection';
import { TestimonialsSection }  from '@/components/public/home/TestimonialsSection';
import { FinalCTA }            from '@/components/public/home/FinalCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      <ServicesPreview />
      <HowItWorks />
      <TrackingCTA />
      <BrandsSection />
      <TestimonialsSection />
      <FinalCTA />
    </>
  );
}