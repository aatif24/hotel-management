// app/api/tables/route.ts
import { prisma } from "@prisma/prisma";

import { getCurrentUser, requirePermission } from "@lib/auth/helpers";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@lib/api/response";
import { CACHE_TTL, cacheKeys, getCached } from "@lib/redis";
import { withCircuitBreaker } from "@lib/circuit-breaker";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse("Unauthorized", 401);
  try {
    await requirePermission(user.id, "order.view");
  } catch (error) {
    console.error("Error fetching tables:", error);
    return handleApiError(error);
  }
  try {
    const res = await withCircuitBreaker(() =>
      getCached(
        cacheKeys.tables(),
        async () => {
          try {
            const tables = await prisma.table.findMany({
              orderBy: {
                number: "asc",
              },
            });
            return tables;
          } catch (error) {
            console.error("Error fetching tables:", error);
            return error;
          }
        },
        CACHE_TTL.SHORT,
      ),
    );
    return successResponse(res);
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
