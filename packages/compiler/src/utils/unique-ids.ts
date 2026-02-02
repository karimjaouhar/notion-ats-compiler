export type UniqueIdFn = (base: string) => string;

export function createUniqueIdFn(): UniqueIdFn {
  const counts = new Map<string, number>();

  return (base: string) => {
    const normalized = base.trim();
    const current = counts.get(normalized) ?? 0;
    const next = current + 1;
    counts.set(normalized, next);
    return next === 1 ? normalized : `${normalized}-${next}`;
  };
}
