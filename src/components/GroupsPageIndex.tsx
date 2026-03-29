import { Box } from "@mui/material";
import { Link } from "react-router";

export default function GroupsPageIndex() {
  return (
    <Box>
      <Link to={"create-group"}>Create new group</Link>;
    </Box>
  );
}
