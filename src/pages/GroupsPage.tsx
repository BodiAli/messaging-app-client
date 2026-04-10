import {
  Box,
  Typography,
  Card,
  CardHeader,
  Skeleton,
  Stack,
  CardActionArea,
  type CardActionAreaProps,
} from "@mui/material";
import { Outlet, NavLink } from "react-router";
import { useGetGroupsQuery } from "@/slices/groupsSlice";
import handleUnexpectedError from "@/utils/handleUnexpectedError";

const CustomCardActionArea = (
  props: CardActionAreaProps<"button", { to: string }>,
) => {
  return <CardActionArea {...props} />;
};

export default function GroupsPage() {
  const {
    data = { groups: [] },
    isError,
    error,
    isFetching,
  } = useGetGroupsQuery(undefined);

  if (isError) {
    handleUnexpectedError(error);
  }

  const sortedGroups = data.groups.toSorted((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });

  return (
    <Box
      component={"main"}
      sx={{ display: "grid", gridTemplateColumns: "0.3fr 1fr", flex: 1 }}
    >
      <Box
        component={"section"}
        sx={{
          maxHeight: "700px",
          overflowY: "auto",
          scrollbarColor: "gray transparent",
        }}
      >
        <Typography variant="h2" sx={{ paddingY: 3, textAlign: "center" }}>
          Your groups
        </Typography>
        {isFetching ? (
          <Card>
            <CardHeader
              avatar={
                <Skeleton
                  height={40}
                  width={40}
                  variant="circular"
                  animation="wave"
                />
              }
              title={<Skeleton animation="wave" />}
            />
          </Card>
        ) : sortedGroups.length === 0 ? (
          <Typography
            sx={{
              textAlign: "center",
            }}
          >
            You are not in any groups
          </Typography>
        ) : (
          <Stack spacing={5}>
            {sortedGroups.map((group) => {
              return (
                <Card key={group.id}>
                  <CustomCardActionArea
                    LinkComponent={NavLink}
                    to={group.id}
                    sx={{
                      "&.active": {
                        backgroundColor: "action.selected",
                      },
                    }}
                  >
                    <CardHeader title={group.name} />
                  </CustomCardActionArea>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
      <Outlet />
    </Box>
  );
}
