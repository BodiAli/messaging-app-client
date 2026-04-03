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
    <Box
      component={"section"}
      sx={{
        paddingY: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Link
          component={RouterLink}
          to="details"
          sx={{
            color: "#fff",
            textDecoration: "none",
            paddingY: 1,
            paddingX: 2,
            marginBottom: 3,
            borderRadius: "5px",
            fontSize: "1.1rem",
            transition: "background-color 200ms",
            backgroundColor: (theme) => theme.palette.primary.light,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.primary.main,
            },
          }}
        >
          {data.group.name}
        </Link>
      </Box>
      <Chatting
        currentUserId={currentUser.id}
        isFetching={isFetching}
        messages={data.messages}
      />
    </Box>
  );
}
