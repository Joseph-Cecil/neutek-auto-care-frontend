'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, Calendar, User, Wrench, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input }    from '@/components/ui/input';
import { Button }   from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useServices } from '@/hooks/useServices';
import { useCreateBooking } from '@/hooks/useBooking';
import { useAuthStore } from '@/stores/auth.store';
import { pesewasToGHS, formatDuration } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Booking } from '@/lib/dto';

const STEPS = ['Select Services', 'Date & Time', 'Your Details', 'Confirm'];

const guestSchema = z.object({
  guestName:  z.string().min(1, 'Name is required'),
  guestPhone: z.string().min(9, 'Valid phone required').max(20),
  guestEmail: z.string().email().optional().or(z.literal('')),
  scheduledAt:z.string().min(1, 'Please select a date and time'),
  notes:      z.string().max(500).optional(),
});
type GuestFormData = z.infer<typeof guestSchema>;

function BookingContent() {
  const searchParams    = useSearchParams();
  const preselected     = searchParams.get('service');
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [step,     setStep]     = useState(0);
  const [selected, setSelected] = useState<string[]>(preselected ? [preselected] : []);
  const [booking,  setBooking]  = useState<Booking | null>(null);

  const { data: servicesData, isLoading: servicesLoading } = useServices({ active: true, limit: 100 });
  const { mutate: createBooking, isPending } = useCreateBooking();
  const services = servicesData?.data ?? [];

  const form = useForm<GuestFormData>({
    resolver:      zodResolver(guestSchema),
    defaultValues: { guestName: '', guestPhone: '', guestEmail: '', scheduledAt: '', notes: '' },
  });

  const toggleService = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const getMinDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    return d.toISOString().slice(0, 16);
  };

  const selectedServices = services.filter((s) => selected.includes(s.id));
  const totalPesewas     = selectedServices.reduce((acc, s) => acc + s.base_price_pesewas, 0);

  const onSubmit = (data: GuestFormData) => {
    const payload = isAuthenticated
      ? { serviceIds: selected, scheduledAt: data.scheduledAt, notes: data.notes || undefined }
      : {
          guestName:  data.guestName,
          guestPhone: data.guestPhone,
          guestEmail: data.guestEmail || undefined,
          serviceIds: selected,
          scheduledAt:data.scheduledAt,
          notes:      data.notes || undefined,
        };

    createBooking(payload, {
      onSuccess: (res) => {
        setBooking(res.data.data);
        setStep(4);
      },
    });
  };

  // Success screen
  if (step === 4 && booking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
          <p className="mt-2 text-white/60">Your appointment has been scheduled.</p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/40">Booking Number</p>
            <p className="mt-1 font-mono text-xl font-bold text-primary">{booking.booking_number}</p>
          </div>
          <p className="mt-4 text-sm text-white/40">
            Save this number to track your repair status.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Button onClick={() => window.location.href = '/tracking'} className="w-full">
              Track My Car
            </Button>
            <Button variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full border-white/20 text-white hover:bg-white/10">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white lg:text-4xl">Book a Service</h1>
        <p className="mt-2 text-white/50">Schedule your appointment in minutes</p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
              i < step  ? 'bg-primary text-white' :
              i === step ? 'border-2 border-primary text-primary bg-transparent' :
                           'border border-white/20 text-white/30 bg-transparent',
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={cn(
              'ml-2 hidden text-xs sm:block',
              i === step ? 'text-white font-medium' : 'text-white/30',
            )}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn('mx-2 flex-1 h-px', i < step ? 'bg-primary' : 'bg-white/10')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Select Services */}
      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-white/60">Select one or more services:</p>
          {servicesLoading ? <SectionLoader /> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => {
                const isSelected = selected.includes(service.id);
                return (
                  <button key={service.id} type="button" onClick={() => toggleService(service.id)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/30',
                    )}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="mt-0.5 text-xs text-white/40">{formatDuration(service.estimated_duration_minutes)}</p>
                      </div>
                      <p className="shrink-0 font-bold text-primary text-sm">
                        {pesewasToGHS(service.base_price_pesewas)}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="mt-2 text-xs text-primary font-medium">✓ Selected</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selected.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/60">{selected.length} service(s) selected</p>
                <p className="font-bold text-primary">{pesewasToGHS(totalPesewas)}</p>
              </div>
            </div>
          )}

          <Button onClick={() => setStep(1)} disabled={selected.length === 0} className="w-full gap-1.5">
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step 1: Date & Time */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Calendar className="h-5 w-5 text-primary" /> Choose Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <FormField control={form.control} name="scheduledAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Preferred Date & Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" min={getMinDateTime()}
                        className="border-white/20 bg-white/10 text-white focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel className="text-white/70">Notes (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Any additional information..."
                        className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </Form>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)}
              className="gap-1.5 border-white/20 text-white hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={async () => {
              const valid = await form.trigger('scheduledAt');
              if (valid) setStep(2);
            }} className="flex-1 gap-1.5">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Customer Details */}
      {step === 2 && (
        <div className="space-y-4">
          {isAuthenticated ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                    {user?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-white/50">{user?.email}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/40">Booking as your registered account</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <User className="h-5 w-5 text-primary" /> Your Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField control={form.control} name="guestName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Jane Doe"
                            className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guestPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="0XX XXX XXXX"
                            className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="guestEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70">Email (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="you@example.com"
                            className="border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}
              className="gap-1.5 border-white/20 text-white hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={async () => {
              if (!isAuthenticated) {
                const valid = await form.trigger(['guestName', 'guestPhone']);
                if (!valid) return;
              }
              setStep(3);
            }} className="flex-1 gap-1.5">
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Wrench className="h-5 w-5 text-primary" /> Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wide">Services</p>
                {selectedServices.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-sm text-white/80">{s.name}</span>
                    <span className="text-sm font-medium text-white">{pesewasToGHS(s.base_price_pesewas)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-white">Total (estimate)</span>
                  <span className="font-bold text-primary">{pesewasToGHS(totalPesewas)}</span>
                </div>
              </div>
              <div className="border-t border-white/10 pt-3">
                <p className="text-xs text-white/40 mb-1 uppercase tracking-wide">Scheduled</p>
                <p className="text-sm text-white">{new Date(form.getValues('scheduledAt')).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}
              className="gap-1.5 border-white/20 text-white hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="flex-1">
              {isPending
                ? <><LoadingSpinner size="sm" className="mr-2" />Confirming...</>
                : 'Confirm Booking'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<SectionLoader />}>
      <BookingContent />
    </Suspense>
  );
}