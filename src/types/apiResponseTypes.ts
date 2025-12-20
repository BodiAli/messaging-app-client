import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface apiClientError {
  errors: { message: string }[];
}
export interface apiServerError {
  error: string;
}

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function isClientError(data: unknown): data is apiClientError {
  return (
    typeof data === "object" &&
    data !== null &&
    "errors" in data &&
    Array.isArray(data.errors)
  );
}

export function isServerError(data: unknown): data is apiServerError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  );
}
