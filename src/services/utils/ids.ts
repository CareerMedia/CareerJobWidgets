export function createId(prefix: string): string {
  const rnd = Math.random().toString(16).slice(2);
  return `${prefix}_${Date.now().toString(36)}_${rnd}`;
}

