const CIRCUIT_KEY = "db:circuit";

export async function withCircuitBreaker<T>(
  fn: () => Promise<T>
): Promise<T> {
  const isOpen = await redis.get(CIRCUIT_KEY);
  if (isOpen) throw new Error("DB temporarily unavailable");

  try {
    return await fn();
  } catch (err) {
    await redis.set(CIRCUIT_KEY, "open", { ex: 10 }); // 10 sec
    throw err;
  }
}
