import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import { Box } from "@mui/material";
import { useGetTwoUsersMessagesQuery } from "@/slices/messagesSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";
import Loader from "@/components/Loader/Loader";
import UserChat from "@/components/UserChat";

function assert(userId: unknown): asserts userId {
  if (!userId) {
    throw new Error("userId is undefined");
  }
}

export default function TwoUsersChatPage() {
  const { userId } = useParams<"userId">();
  assert(userId);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: chatData,
    isError,
    error,
    isLoading,
    isFetching,
  } = useGetTwoUsersMessagesQuery(userId);

  // Use a “useEffect” here to prevent react logging the warning “Cannot update a component (`RouterProvider`) while rendering a different component (`TwoUsersChatPage`).”
  // The navigate function calls setState() and without a “useEffect” this can cause the state to be modified while rendering TwoUsersChatPage component.
  useEffect(() => {
    if (isError) {
      if (isFetchBaseQueryError(error)) {
        if (isClientError(error.data)) {
          void navigate("/", { replace: true });
          error.data.errors.forEach((error) => {
            enqueueSnackbar(error.message, {
              variant: "error",
            });
          });
          return;
        }
      }
      handleUnexpectedError(error);
    }
  }, [error, isError, enqueueSnackbar, navigate]);

  return (
    <Box
      component={"section"}
      sx={{
        position: "relative",
        marginBottom: 2,
      }}
    >
      {isLoading || !chatData ? (
        <Loader />
      ) : (
        <UserChat chatData={chatData} isFetching={isFetching} />
      )}
    </Box>
  );
}
