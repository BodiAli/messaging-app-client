import { useParams } from "react-router";
import { useGetTwuUsersMessagesQuery } from "@/slices/messagesSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

function assert(val: unknown): asserts val {
  if (!val) {
    throw new Error("Value is undefined");
  }
}

export default function TwoUsersChatPage() {
  const { userId } = useParams<{ userId: string }>();
  assert(userId);
  const { isError, error, isLoading } = useGetTwuUsersMessagesQuery(userId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) {
    handleUnexpectedError(error);
  }

  return <p>asd</p>;
}
