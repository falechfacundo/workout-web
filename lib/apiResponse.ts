import { NextResponse } from "next/server";

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function createdResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return successResponse(data, message, 201);
}

export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, 404);
}

export function unauthorizedResponse(
  message: string = "Unauthorized"
): NextResponse<ApiResponse> {
  return errorResponse(message, 401);
}

export function forbiddenResponse(
  message: string = "Forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(message, 403);
}

export function serverErrorResponse(
  message: string = "Internal server error"
): NextResponse<ApiResponse> {
  return errorResponse(message, 500);
}