import { ErrorCode } from "../error";

/**
 * Standard result format for server actions
 */
export type SafeActionResult<T> = {
  data: T | null;
  error: string | null;
  code?: ErrorCode;
  field?: string;
};

/**
 * Type for handlers in server actions
 */
export type ActionHandler<T, R> = (data: T) => Promise<SafeActionResult<R>>;
