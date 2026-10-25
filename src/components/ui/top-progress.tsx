/** Prototype top bar. Mount it on a screen that is waiting. Layouts do not mount it yet. */
export function TopProgress({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-[200] h-[3px] w-2/5 bg-[var(--color-nt-surface-brand)]"
      role="progressbar"
      aria-valuetext="Loading"
    />
  );
}
