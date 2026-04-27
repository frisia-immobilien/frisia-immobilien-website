export function roundEuroToThousand(value: number) {
  return Math.round(value / 1000) * 1000;
}

export function calculateRange(value: number) {
  const adjusted = roundEuroToThousand(value);
  return {
    adjusted_value: adjusted,
    range_min: roundEuroToThousand(adjusted * 0.9),
    range_max: roundEuroToThousand(adjusted * 1.1),
  };
}
