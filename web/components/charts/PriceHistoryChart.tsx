import type { PriceHistoryRow } from "@/lib/types/leadgen";

type Props = {
  title: string;
  rows: PriceHistoryRow[];
};

export default function PriceHistoryChart({ title, rows }: Props) {
  const rowsWithValues = rows.filter((row) => Number(row.median_preis_eur_m2 ?? 0) > 0);
  if (rowsWithValues.length < 3) return null;

  const values = rowsWithValues.map((row) => Number(row.median_preis_eur_m2));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 1180;
  const height = 360;
  const padding = 66;
  const chartColor = "var(--color-navy)";
  const chartTitleId = `price-chart-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const span = Math.max(1, max - min);
  const step = rowsWithValues.length > 1 ? innerWidth / (rowsWithValues.length - 1) : innerWidth;
  const points = rowsWithValues.map((row, index) => {
    const value = Number(row.median_preis_eur_m2 ?? min);
    const x = padding + index * step;
    const y = padding + innerHeight - ((value - min) / span) * innerHeight;
    return { x, y, value, year: row.year };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <figure className="w-full" aria-label={title}>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby={chartTitleId} className="h-auto w-full">
        <title id={chartTitleId}>{title}</title>
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d8c7aa" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d8c7aa" />
        <path d={path} fill="none" stroke={chartColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point) => (
          <g key={point.year}>
            <circle cx={point.x} cy={point.y} r="8" fill={chartColor} stroke="#fff" strokeWidth="5" />
            <text x={point.x} y={height - 18} textAnchor="middle" fontSize="16" fill="#52616d">
              {point.year}
            </text>
            <text x={point.x} y={Math.max(24, point.y - 18)} textAnchor="middle" fontSize="15" fill={chartColor}>
              {Math.round(point.value).toLocaleString("de-DE")} €
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-2 text-xs leading-5 text-[color:var(--color-graphite)]">
        Medianpreis in Euro pro Quadratmeter. Nur echte vorhandene Jahreswerte werden angezeigt.
      </figcaption>
    </figure>
  );
}
