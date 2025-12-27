import { isFetchBaseQueryError } from "@/types/apiResponseTypes";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit/react";

export default function isUnauthorized(
  error: SerializedError | FetchBaseQueryError,
) {
  if (
    isFetchBaseQueryError(error) &&
    typeof error.status === "number" &&
    error.status === 401 &&
    error.data === "Unauthorized"
  ) {
    return true;
  }

  return false;
}
