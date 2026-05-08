const BRANDS = [
  'Toyota', 'Mercedes-Benz', 'BMW', 'Honda',
  'Nissan', 'Hyundai', 'Kia', 'Ford',
];

export function BrandsSection() {
  return (
    <section className="py-14 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="mb-8 text-center text-sm font-medium text-white/30 uppercase tracking-widest">
          Featured Vehicle Brands We Support
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
          {BRANDS.map((brand) => (
            <div key={brand}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/50 transition-colors hover:border-primary/30 hover:text-white">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}