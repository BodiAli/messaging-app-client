import { ListItem } from "@mui/material";
import {
  isFetchBaseQueryError,
  isClientError,
  isServerError,
} from "@/types/apiResponseTypes";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ReactElement } from "react";
import type { SerializedError } from "@reduxjs/toolkit/react";

export default function handleError(
  error: SerializedError | FetchBaseQueryError,
): ReactElement[] | never {
  let errorsList: ReactElement[];
  if (isFetchBaseQueryError(error)) {
    if (typeof error.status === "number") {
      if (isClientError(error.data)) {
        errorsList = error.data.errors.map((error) => {
          return (
            <ListItem
              key={error.message}
              sx={{
                display: "list-item",
              }}
            >
              {error.message}
            </ListItem>
          );
        });
        return errorsList;
      } else if (isServerError(error.data)) {
        throw new Error(error.data.error.message);
      }

      throw new Error(String(error.data));
    } else {
      throw new Error(error.error);
    }
  }
  throw new Error(error.message);
}
