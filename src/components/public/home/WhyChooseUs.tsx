import {
  Zap, Shield, Clock, DollarSign,
  Smartphone, Wrench,
} from 'lucide-react';

const FEATURES = [
  {
    Icon:        Zap,
    title:       'Advanced Computer Diagnostics',
    description: 'State-of-the-art OBD scanners and proprietary diagnostic tools to pinpoint any fault.',
  },
  {
    Icon:        Wrench,
    title:       'ECU Repair Specialists',
    description: 'We repair car motherboards (ECUs) that others can\'t diagnose — saving you thousands.',
  },
  {
    Icon:        Shield,
    title:       'Certified Technicians',
    description: 'Our team holds international automotive certifications with years of hands-on experience.',
  },
  {
    Icon:        Clock,
    title:       'Fast Turnaround',
    description: 'Most diagnostics completed same-day. Complex repairs done in 48–72 hours.',
  },
  {
    Icon:        Smartphone,
    title:       'Digital Repair Tracking',
    description: 'Track your repair in real time. Approve quotes and pay invoices online — no phone calls needed.',
  },
  {
    Icon:        DollarSign,
    title:       'Transparent Pricing',
    description: 'Detailed quotes before any work begins. No hidden charges. No surprises.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            Why Choose <span className="gradient-text">Neutek Auto Care</span>
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            We combine technology with expertise to deliver automotive care that&apos;s faster,
            smarter, and more transparent than traditional workshops.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, description }) => (
            <div key={title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-primary/30 hover:bg-white/8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}