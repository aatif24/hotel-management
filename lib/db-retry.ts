export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 100
): Promise<T> {
  try {
    return await fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (retries === 0) throw err;

    if (err.code === "P1001" || err.code === "P1002") {
      await new Promise((r) => setTimeout(r, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }

    throw err;
  }
}
