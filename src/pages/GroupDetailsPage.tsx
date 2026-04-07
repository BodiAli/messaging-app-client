import { useParams } from "react-router";
import { Box } from "@mui/material";
import { useGetGroupDetailsQuery } from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

export default function GroupDetailsPage() {
  const { groupId } = useParams<"groupId">();
  assert(groupId);
  const { isError, error } = useGetGroupDetailsQuery(groupId);

  if (isError) {
    handleUnexpectedError(error);
  }

  return (
    <Box>
      <p>GROUP DETAILS</p>;
    </Box>
  );
}

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is not defined");
  }
}
