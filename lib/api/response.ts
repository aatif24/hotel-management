// lib/api/response.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 400,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(errors && { details: errors }),
      },
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    return errorResponse("Validation error", 400, error.issues);
  }

  if (error instanceof Error) {
    if (error.message.includes("Forbidden")) {
      return errorResponse(error.message, 403);
    }
    if (error.message.includes("Not found")) {
      return errorResponse(error.message, 404);
    }
    return errorResponse(error.message, 500);
  }

  return errorResponse("Internal server error", 500);
}
