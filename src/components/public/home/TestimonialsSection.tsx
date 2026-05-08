const TESTIMONIALS = [
  {
    quote:  'Neutek solved an ECU problem three other workshops could not diagnose. My car runs perfectly now.',
    author: 'Kwame A.',
    role:   'Toyota Camry Owner',
  },
  {
    quote:  'The online tracking is incredible. I approved my repair quote from my office and got notified when it was ready.',
    author: 'Abena M.',
    role:   'Mercedes C-Class Owner',
  },
  {
    quote:  'Fast, professional, and honest pricing. Neutek is the only workshop I trust with my BMW.',
    author: 'Kofi B.',
    role:   'BMW 3 Series Owner',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-white/2">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white lg:text-4xl">
            What Our Customers Say
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ quote, author, role }) => (
            <div key={author}
              className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="mb-4 text-3xl text-primary leading-none">&ldquo;</div>
              <p className="text-sm text-white/70 leading-relaxed">{quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {author[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{author}</p>
                  <p className="text-xs text-white/40">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}