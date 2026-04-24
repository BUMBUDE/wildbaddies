export const formatCount = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const v = n / 1_000_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 1_000) {
    const v = n / 1_000;
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `${n}`;
};

export const formatRating = (r: number | null | undefined): string => {
  if (r === null || r === undefined || Number.isNaN(r)) return "";
  return Number(r).toFixed(5);
};