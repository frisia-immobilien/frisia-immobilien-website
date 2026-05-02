export default function HeroDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`mt-6 h-1 w-32 bg-[color:var(--color-brass)] ${className}`.trim()}
    />
  );
}
