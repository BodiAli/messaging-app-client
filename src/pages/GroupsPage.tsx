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
    isLoading,
    isError,
    error,
  } = useGetGroupsQuery(undefined);

  if (isError) {
    handleUnexpectedError(error);
  }

  return (
    <Box
      component={"main"}
      sx={{ display: "grid", gridTemplateColumns: "0.3fr 1fr", flex: 1 }}
    >
      <Box component={"section"}>
        <Typography variant="h2" sx={{ paddingY: 3, textAlign: "center" }}>
          Your groups
        </Typography>
        {isLoading ? (
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
        ) : data.groups.length === 0 ? (
          <Typography>You are not in any groups</Typography>
        ) : (
          <Stack>
            {data.groups.map((group) => {
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
