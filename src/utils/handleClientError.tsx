import { ListItem } from "@mui/material";
import { type ApiClientError } from "@/types/apiResponseTypes";

export default function handleClientError(error: ApiClientError) {
  const errorsList = error.errors.map((error) => {
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
}
