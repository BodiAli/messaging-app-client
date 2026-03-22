import { Box, Typography, Link } from "@mui/material";
import { Outlet, Link as RouterLink } from "react-router";
import { useGetGroupsQuery } from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

export default function GroupsPage() {
  const {
    data = { groups: [] },
    isLoading,
    isError,
    error,
  } = useGetGroupsQuery(undefined);

  if (isLoading) return <p>Loading...</p>;

  if (isError) {
    handleUnexpectedError(error);
  }

  return (
    <Box component={"main"}>
      {data.groups.length === 0 ? (
        <Typography>You are not in any groups</Typography>
      ) : (
        data.groups.map((group) => {
          return (
            <Link key={group.id} to={group.id} component={RouterLink}>
              {group.name}
            </Link>
          );
        })
      )}
      <Outlet />
    </Box>
  );
}
