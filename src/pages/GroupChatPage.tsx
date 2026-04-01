import { useEffect } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router";
import { Box, Link } from "@mui/material";
import { useSnackbar } from "notistack";
import { useGetGroupMessagesQuery } from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import Loader from "@/components/Loader/Loader";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
import Chatting from "@/components/Chatting";
import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/slices/authSlice";

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is undefined");
  }
}

export default function GroupChatPage() {
  const { groupId } = useParams<"groupId">();
  assert(groupId);
  const { data, isError, isLoading, isFetching, error } =
    useGetGroupMessagesQuery(groupId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  assert(currentUser);

  useEffect(() => {
    if (isError) {
      if (isFetchBaseQueryError(error) && isClientError(error.data)) {
        error.data.errors.forEach((error) => {
          enqueueSnackbar(error.message, { variant: "error" });
        });
        void navigate("/", { replace: true });
      } else {
        handleUnexpectedError(error);
      }
    }
  }, [isError, error, enqueueSnackbar, navigate]);

  if (isLoading || !data) {
    return <Loader />;
  }

  return (
    <Box>
      <Link component={RouterLink} to="details">
        {data.group.name}
      </Link>
      <Chatting
        currentUserId={currentUser.id}
        isFetching={isFetching}
        messages={data.messages}
      />
    </Box>
  );
}
