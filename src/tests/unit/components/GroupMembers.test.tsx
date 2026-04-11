import { describe, it, expect, assert, afterEach } from "vitest";
import { screen, within } from "@testing-library/react";
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

  const mockOnRemoveMember = vi.fn<(memberId: string) => Promise<void>>();

  const renderGroupMembers = (
    isAdmin = true,
    members = mockGroupMembers,
    isRemovingMember = false,
  ) => {
    return renderWithProviders(
      <GroupMembers
        isGroupAdmin={isAdmin}
        groupMembers={members}
        isRemovingMember={isRemovingMember}
        onRemoveMember={mockOnRemoveMember}
      />,
    );
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering group members count", () => {
    it("should render how many group members in pluralized form if members are more than 1", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const groupMembersCount = screen.getByText("2 members");

      expect(groupMembersCount).toBeInTheDocument();
    });

    it("should render how many group members in singular form if members are 1", () => {
      expect.hasAssertions();

      renderGroupMembers(true, [...mockGroupMembers.slice(0, 1)]);

      const groupMembersCount = screen.getByText("1 member");

      expect(groupMembersCount).toBeInTheDocument();
    });

    it("should render a message indicating no group members when there are no group members", () => {
      expect.hasAssertions();

      renderGroupMembers(true, []);

      const groupMembersCount = screen.getByText("Group has no members.");

      expect(groupMembersCount).toBeInTheDocument();
    });
  });

  describe("rendering group members", () => {
    it("should render each member's avatar", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const userAAvatar = screen.getByTitle(
        "Test: userA username no profile picture",
      );
      const userBAvatar = screen.getByRole("img", {
        name: "Test: userB username's profile picture",
      });

      expect(userAAvatar).toBeInTheDocument();
      expect(userBAvatar).toBeInTheDocument();
    });

    it("should render each member's username", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const userA = screen.getByText("Test: userA username");
      const userB = screen.getByText("Test: userB username");

      expect(userA).toBeInTheDocument();
      expect(userB).toBeInTheDocument();
    });
  });

  describe("rendering remove member button", () => {
    it("should not render a remove member buttons when current user is not admin of the group", () => {
      expect.hasAssertions();

      renderGroupMembers(false);

      const removeMemberButtons = screen.queryAllByRole("button", {
        name: "Remove Member",
      });

      expect(removeMemberButtons).toHaveLength(0);
    });

    it("should render a remove member buttons when current user is admin of the group", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const removeMemberButtons = screen.getAllByRole("button", {
        name: "Remove Member",
      });

      expect(removeMemberButtons).toHaveLength(2);
    });

    it("should disable remove member buttons when isRemovingMember true", () => {
      expect.hasAssertions();

      renderGroupMembers(true, mockGroupMembers, true);

      const removeMemberButtons = screen.getAllByRole("button", {
        name: "Remove Member",
      });

      for (const removeMemberButton of removeMemberButtons) {
        expect(removeMemberButton).toBeDisabled();
      }
    });

    it("should not disable remove member buttons when isRemovingMember false", () => {
      expect.hasAssertions();

      renderGroupMembers();

      const removeMemberButtons = screen.getAllByRole("button", {
        name: "Remove Member",
      });

      for (const removeMemberButton of removeMemberButtons) {
        expect(removeMemberButton).toBeEnabled();
      }
    });
  });

  describe("clicking remove member", () => {
    it("should render a modal when remove member is clicked", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const removeMemberButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(removeMemberButton);
      const modalNotShown = screen.queryByRole("dialog");

      await userEvent.click(removeMemberButton);
      const modalShown = screen.getByRole("dialog");

      expect(modalNotShown).not.toBeInTheDocument();
      expect(modalShown).toBeInTheDocument();
    });
  });

  describe("rendering modal content based on current member's remove button", () => {
    it("should have a confirmation message with the userA's username", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const userARemoveButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(userARemoveButton);
      await userEvent.click(userARemoveButton);

      const modal = screen.getByRole("dialog");
      const confirmationMessage = within(modal).getByText(
        "Are you sure you want to remove Test: userA username?",
      );

      expect(confirmationMessage).toBeInTheDocument();
    });

    it("should have a confirmation message with the userB's username", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const userBRemoveButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[1];
      assert(userBRemoveButton);
      await userEvent.click(userBRemoveButton);

      const modal = screen.getByRole("dialog");
      const confirmationMessage = within(modal).getByText(
        "Are you sure you want to remove Test: userB username?",
      );

      expect(confirmationMessage).toBeInTheDocument();
    });
  });

  describe("rendering modal content regardless of current member", () => {
    it("should render cancel and confirm buttons", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const removeMemberButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(removeMemberButton);

      await userEvent.click(removeMemberButton);
      const modal = screen.getByRole("dialog");
      const cancelButton = within(modal).getByRole("button", {
        name: "Cancel",
      });
      const confirmButton = within(modal).getByRole("button", {
        name: "Confirm",
      });

      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe("hiding modal", () => {
    it("should hide modal when cancel button is clicked", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const removeMemberButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(removeMemberButton);
      await userEvent.click(removeMemberButton);

      const modal = screen.getByRole("dialog");
      const cancelButton = within(modal).getByRole("button", {
        name: "Cancel",
      });
      await userEvent.click(cancelButton);

      expect(modal).not.toBeInTheDocument();
    });

    it("should hide modal when confirm button is clicked", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const removeMemberButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(removeMemberButton);
      await userEvent.click(removeMemberButton);

      const modal = screen.getByRole("dialog");
      const confirmButton = within(modal).getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(modal).not.toBeInTheDocument();
    });
  });

  describe("removing member", () => {
    it("should call onRemoveMember with userA's id when userA's button is clicked", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const userARemoveButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[0];
      assert(userARemoveButton);
      await userEvent.click(userARemoveButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockOnRemoveMember).toHaveBeenCalledExactlyOnceWith<[string]>(
        "Test-UserA-Id",
      );
    });

    it("should call onRemoveMember with userB's id when userB's button is clicked", async () => {
      expect.hasAssertions();

      renderGroupMembers();
      const userBRemoveButton = screen.getAllByRole("button", {
        name: "Remove Member",
      })[1];
      assert(userBRemoveButton);
      await userEvent.click(userBRemoveButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockOnRemoveMember).toHaveBeenCalledExactlyOnceWith<[string]>(
        "Test-UserB-Id",
      );
    });
  });
});
