const STEPS = [
  { step: '01', title: 'Book or Arrive',    description: 'Schedule online or walk in. We\'re ready for you.' },
  { step: '02', title: 'Digital Intake',    description: 'We capture your vehicle details and issue a job number.' },
  { step: '03', title: 'Diagnosis',         description: 'Our technicians run full computer diagnostics.' },
  { step: '04', title: 'Quote Approval',    description: 'Review and approve your repair quote online.' },
  { step: '05', title: 'Repair',            description: 'Certified technicians carry out the approved work.' },
  { step: '06', title: 'Payment',           description: 'Pay online or in person. Invoice emailed instantly.' },
  { step: '07', title: 'Follow-Up',         description: 'We check in after your service to ensure satisfaction.' },
];

export function HowItWorks() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">How It Works</h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            From booking to follow-up, every step is tracked digitally so you always know what&apos;s happening.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-8 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-primary/50 to-transparent lg:block" />

          <div className="space-y-6">
            {STEPS.map(({ step, title, description }, i) => (
              <div key={step} className="flex gap-6 lg:gap-8">
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
                  <span className="text-sm font-bold text-primary">{step}</span>
                  {i < STEPS.length - 1 && (
                    <div className="absolute -bottom-6 left-1/2 hidden h-6 w-px -translate-x-1/2 bg-primary/20 lg:block" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-white/50">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}