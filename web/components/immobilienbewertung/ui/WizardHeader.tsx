"use client";

export function WizardHeader(props: {
  stepIndex: number;
  stepsLength: number;
  progress: number;
  overline: string;
  title: string;
  subtitle: string;
}) {
  const { stepIndex, stepsLength, progress, overline, title, subtitle } = props;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-600">
          Schritt {stepIndex + 1} / {stepsLength}
        </div>
        <div className="text-sm font-medium text-slate-600">{progress}%</div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {overline}
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-2 text-base leading-relaxed text-slate-700">{subtitle}</p>
      </div>
    </>
  );
}
