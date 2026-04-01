import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useSnackbar } from "notistack";
import { useGetGroupMessagesQuery } from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";
import Loader from "@/components/Loader/Loader";
import { isClientError, isFetchBaseQueryError } from "@/types/apiResponseTypes";

function assert(value: unknown): asserts value {
  if (!value) {
    throw new Error("Value is undefined");
  }
}

export default function GroupChatPage() {
  const { groupId } = useParams<"groupId">();
  assert(groupId);
  const { isError, isLoading, error } = useGetGroupMessagesQuery(groupId);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

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

  if (isLoading) {
    return <Loader />;
  }

  return <p>GROUPS CHAT PAGE</p>;
}
