import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createLogger } from "./logger";

const logger = createLogger("http");

/**
 * Middleware function to log HTTP requests and responses
 * This can be used either as part of the global Next.js middleware
 * or as a wrapper around API route handlers
 */
export async function logRequest(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const start = Date.now();
  const requestId = nanoid();

  // Extract useful information from the request
  const url = req.nextUrl.toString();
  const method = req.method;
  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown";

  // Log the incoming request
  logger.info(`${method} ${url}`, {
    requestId,
    userAgent,
    ip,
    method,
    url,
  });

  try {
    // Process the request
    const response = await handler(req);

    // Calculate duration and log response
    const duration = Date.now() - start;

    logger.info(`${method} ${url} ${response.status} - ${duration}ms`, {
      requestId,
      method,
      url,
      status: response.status,
      duration,
    });

    // Add tracking headers to the response
    response.headers.set("X-Request-ID", requestId);

    return response;
  } catch (error: any) {
    // Calculate duration and log error
    const duration = Date.now() - start;

    logger.error(`${method} ${url} FAILED - ${duration}ms`, error, {
      requestId,
      method,
      url,
      duration,
      errorMessage: error.message,
    });

    // Return appropriate error response
    const errorResponse = NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: error.httpStatus || 500 }
    );

    errorResponse.headers.set("X-Request-ID", requestId);

    return errorResponse;
  }
}

/**
 * Wrapper function for API route handlers
 */
export function withLogging(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return (req: NextRequest) => logRequest(req, handler);
}
