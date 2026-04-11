import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import GroupMembers from "@/components/GroupMembers";
import type { User } from "@/types/modelsType";

describe("group-members component", () => {
  const mockGroupMembers: Pick<User, "id" | "username" | "imageUrl">[] = [
    {
      id: "Test-UserA-Id",
      imageUrl: null,
      username: "Test: userA username",
    },
    {
      id: "Test-UserB-Id",
      imageUrl: "Test-UserB-Image-Url",
      username: "Test: userB username",
    },
  ];

  const renderGroupMembers = (isAdmin = true, members = mockGroupMembers) => {
    return renderWithProviders(
      <GroupMembers isGroupAdmin={isAdmin} groupMembers={members} />,
    );
  };

  describe("rendering group members count", () => {
    it("should render how many group members in pluralized form if members are more than 1", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const groupMembersCount = screen.getByText("2 members");

      expect(groupMembersCount).toBeInTheDocument();
    });
    it.todo(
      "should render how many group members in singular form if members are 1",
    );
  });
});
