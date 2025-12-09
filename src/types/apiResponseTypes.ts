export interface apiClientError {
  errors: { message: string }[];
}
export interface apiServerError {
  error: {
    message: string;
  };
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
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error
  );
}
