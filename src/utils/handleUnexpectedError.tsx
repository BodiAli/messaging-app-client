import { isFetchBaseQueryError, isServerError } from "@/types/apiResponseTypes";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit/react";

export default function handleUnexpectedError(
  error: SerializedError | FetchBaseQueryError,
): never {
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === "number") {
      if (isServerError(error.data)) {
        throw new Error(error.data.error);
      }
      throw new Error(String(error.data));
    }
    throw new Error(error.error);
  }
  throw new Error(error.message);
}
