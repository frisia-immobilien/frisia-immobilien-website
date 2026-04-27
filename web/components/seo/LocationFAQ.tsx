export default function LocationFAQ({ items }: { items: Array<{ question: string; answer: string }> }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[980px] px-4 py-12 sm:px-6 md:py-14">
      <h2 className="font-[family-name:var(--font-playfair)] text-3xl leading-tight text-[color:var(--color-navy)]">
        Häufige Fragen
      </h2>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <article key={item.question} className="rounded-lg border border-[color:var(--color-brass)]/25 bg-white p-5">
            <h3 className="text-lg font-semibold leading-snug text-[color:var(--color-navy)]">{item.question}</h3>
            <p className="mt-2 text-base leading-[1.75] text-[color:var(--color-graphite)]">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
