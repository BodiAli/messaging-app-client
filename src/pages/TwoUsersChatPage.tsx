import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useGetTwuUsersMessagesQuery } from "@/slices/messagesSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

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
  const { data, isError, error, isLoading } =
    useGetTwuUsersMessagesQuery(userId);

  useEffect(() => {
    if (isError) {
      if ("data" in error) {
        if (error.status === 404) {
          void navigate(-1);
          enqueueSnackbar(error.data.errors[0].message, {
            variant: "error",
          });
          return;
        }
      }
      handleUnexpectedError(error);
    }
  }, [error, isError, enqueueSnackbar, navigate]);

  if (isLoading) return <p>Loading...</p>;

  return <p>asd</p>;
}
