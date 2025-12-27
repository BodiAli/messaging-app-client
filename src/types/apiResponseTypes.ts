import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface ApiClientError {
  errors: { message: string }[];
}
export interface ApiServerError {
  error: string;
}

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function isClientError(data: unknown): data is ApiClientError {
  return (
    typeof data === "object" &&
    data !== null &&
    "errors" in data &&
    Array.isArray(data.errors)
  );
}

export function isServerError(data: unknown): data is ApiServerError {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  );
}
