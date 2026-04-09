import { describe, it, expect, assert } from "vitest";
import {
  screen,
  render,
  within,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GroupDetailsHeader from "@/components/GroupDetailsHeader";
import type { GroupDetails, User } from "@/types/modelsType";

describe("group-details-header component", () => {
  const mockGroup: Omit<GroupDetails["group"], "users"> = {
    createdAt: "2020-01-01T01:30:30",
    id: "Test-GroupId",
    name: "Test-Group name",
    admin: {
      id: "Test-AdminId",
      imageUrl: "imageUrl",
      username: "Test-Admin username",
    },
  };

  const mockNonMemberUsers: Pick<User, "id" | "imageUrl" | "username">[] = [
    {
      id: "Test-Non-memberId1",
      imageUrl: null,
      username: "Test-Non-member username 1",
    },
    {
      id: "Test-Non-memberId2",
      imageUrl: "imageUrl",
      username: "Test-Non-member username 2",
    },
  ];

  const renderGroupHeader = (
    currentUserId = "Test-AdminId",
    onGroupInvite = vi.fn<(friendIds: string[]) => Promise<void>>(),
    onDeleteGroup = vi.fn<() => Promise<void>>(),
    isSendingInvite = false,
    isDeletingGroup = false,
  ) => {
    return render(
      <GroupDetailsHeader
        group={mockGroup}
        nonMemberUsers={mockNonMemberUsers}
        currentUserId={currentUserId}
        onGroupInvite={onGroupInvite}
        onDeleteGroup={onDeleteGroup}
        isDeletingGroup={isDeletingGroup}
        isSendingInvite={isSendingInvite}
      />,
    );
  };

  describe("rendering group data", () => {
    it("should render group name", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const groupName = screen.getByRole("heading", {
        level: 1,
        name: "Test-Group name",
      });

      expect(groupName).toBeInTheDocument();
    });

    it("should render when the group was created in a formatted way", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const createdAtElement = screen.getByText("Created at");
      const timeElement = within(createdAtElement).getByRole("time");

      expect(createdAtElement).toBeInTheDocument();
      expect(timeElement).toHaveTextContent("Jan 1, 2020, 01:30 AM");
    });

    it("should render who created the group", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const createdByElement = screen.getByText(
        "Created by: Test-Admin username",
      );

      expect(createdByElement).toBeInTheDocument();
    });

    it("should render group admin avatar", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const adminAvatar = screen.getByRole("img", {
        name: "Test-Admin username's profile picture",
      });

      expect(adminAvatar).toBeInTheDocument();
    });
  });

  describe("rendering invite friends to group action elements as non-admin", () => {
    it("should not render invitation elements if current user is not group admin", () => {
      expect.hasAssertions();

      renderGroupHeader("Test-Non-AdminId");

      const comboBox = screen.queryByRole("combobox");

      expect(comboBox).not.toBeInTheDocument();
    });
  });

  describe("rendering invite friends to group action elements as admin", () => {
    it("should render invitation elements if current user is group admin", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const comboBox = screen.queryByRole("combobox");

      expect(comboBox).toBeInTheDocument();
    });

    it("should disable invite friends input while isSendingInvite is true", () => {
      expect.hasAssertions();

      renderGroupHeader(
        "Test-AdminId",
        vi.fn<(friendIds: string[]) => Promise<void>>(),
        vi.fn<() => Promise<void>>(),
        true,
      );

      const invitationInput = screen.getByRole("combobox", {
        name: "Invite friends",
      });

      expect(invitationInput).toBeDisabled();
    });

    it("should not disable invite friends input while isSendingInvite is false", () => {
      expect.hasAssertions();

      renderGroupHeader(
        "Test-AdminId",
        vi.fn<(friendIds: string[]) => Promise<void>>(),
        vi.fn<() => Promise<void>>(),
        false,
      );

      const invitationInput = screen.getByRole("combobox", {
        name: "Invite friends",
      });

      expect(invitationInput).toBeEnabled();
    });

    it("should disable delete group button while isDeletingGroup is true", () => {
      expect.hasAssertions();

      renderGroupHeader(
        "Test-AdminId",
        vi.fn<(friendIds: string[]) => Promise<void>>(),
        vi.fn<() => Promise<void>>(),
        false,
        true,
      );

      const deleteGroupButton = screen.getByRole("button", {
        name: "Delete Group",
      });

      expect(deleteGroupButton).toBeDisabled();
    });

    it("should not disable delete group button while isDeletingGroup is false", () => {
      expect.hasAssertions();

      renderGroupHeader(
        "Test-AdminId",
        vi.fn<(friendIds: string[]) => Promise<void>>(),
        vi.fn<() => Promise<void>>(),
        false,
        false,
      );

      const deleteGroupButton = screen.getByRole("button", {
        name: "Delete Group",
      });

      expect(deleteGroupButton).toBeEnabled();
    });

    it("should render a listbox to select all friends who are not members of the group", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const openSelectElementButton = screen.getByRole("button", {
        name: "Open",
      });
      await userEvent.click(openSelectElementButton);

      const selectElement = screen.getByRole<HTMLSelectElement>("listbox");
      const nonMemberOption1 = within(
        selectElement,
      ).getByRole<HTMLOptionElement>("option", {
        name: /Test-Non-member username 1/,
      });
      const nonMemberOption2 = within(
        selectElement,
      ).getByRole<HTMLOptionElement>("option", {
        name: /Test-Non-member username 2/,
      });

      expect(nonMemberOption1).toHaveTextContent("Test-Non-member username 1");
      expect(nonMemberOption2).toHaveTextContent("Test-Non-member username 2");
    });

    it("should render non member friends avatar inside the options list", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const openSelectElementButton = screen.getByRole("button", {
        name: "Open",
      });
      await userEvent.click(openSelectElementButton);
      const nonMemberOptions = screen.getAllByRole("option");
      assert(nonMemberOptions[0] && nonMemberOptions[1]);

      const nonMemberAvatar1 = within(nonMemberOptions[0]).getByTitle(
        "Test-Non-member username 1 no profile picture",
      );
      const nonMemberAvatar2 = within(nonMemberOptions[1]).getByRole("img", {
        name: "Test-Non-member username 2's profile picture",
      });

      expect(nonMemberAvatar1).toBeInTheDocument();
      expect(nonMemberAvatar2).toBeInTheDocument();
    });

    it("should render an invite button", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });

      expect(inviteButton).toBeInTheDocument();
    });
  });

  describe("inviting friends to join group", () => {
    it("should disable invite button if no friends to invite are selected", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });

      expect(inviteButton).toBeDisabled();
    });

    it("should not disable invite button when at least 1 friend is selected", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const openSelectElementButton = screen.getByRole("button", {
        name: "Open",
      });
      await userEvent.click(openSelectElementButton);
      const option1 = screen.getByRole("option", {
        name: "Test-Non-member username 1",
      });
      await userEvent.click(option1);

      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });

      expect(inviteButton).toBeEnabled();
    });

    it("should call onGroupInvite with expected arguments", async () => {
      expect.hasAssertions();

      const mockOnGroupInvite = vi.fn<(friendIds: string[]) => Promise<void>>();
      renderGroupHeader("Test-AdminId", mockOnGroupInvite);
      const openSelectElementButton = screen.getByRole("button", {
        name: "Open",
      });
      await userEvent.click(openSelectElementButton);
      const option1 = screen.getByRole("option", {
        name: /Test-Non-member username 1/,
      });
      const option2 = screen.getByRole("option", {
        name: /Test-Non-member username 2/,
      });
      await userEvent.click(option1);
      await userEvent.click(option2);

      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(inviteButton);

      expect(mockOnGroupInvite).toHaveBeenCalledExactlyOnceWith([
        "Test-Non-memberId1",
        "Test-Non-memberId2",
      ]);
    });
  });

  describe("rendering delete group button as non-admin", () => {
    it("should not render delete group button", () => {
      expect.hasAssertions();

      renderGroupHeader("Test-Non-adminId");

      const deleteButton = screen.queryByRole("button", {
        name: "Delete Group",
      });

      expect(deleteButton).not.toBeInTheDocument();
    });
  });

  describe("rendering delete group button as admin", () => {
    it("should render delete group button", () => {
      expect.hasAssertions();

      renderGroupHeader();

      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });

      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe("deleting group", () => {
    it("should render modal when delete button is clicked", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });
      const modalNotShown = screen.queryByRole("dialog");
      await userEvent.click(deleteButton);
      const modalShown = screen.queryByRole("dialog");

      expect(modalNotShown).not.toBeInTheDocument();
      expect(modalShown).toBeInTheDocument();
    });

    it("should render confirmation message and action buttons inside modal", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);
      const modal = screen.getByRole("dialog");

      const confirmationMessage = within(modal).getByText(
        "Are you sure you want to delete this group?",
      );
      const cancelButton = within(modal).getByRole("button", {
        name: "Cancel",
      });
      const confirmButton = within(modal).getByRole("button", {
        name: "Confirm",
      });

      expect(confirmationMessage).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton).toBeInTheDocument();
    });

    it("should hide modal when cancel button is clicked", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);
      const modal = screen.getByRole("dialog");
      const cancelButton = within(modal).getByRole("button", {
        name: "Cancel",
      });

      await userEvent.click(cancelButton);
      await waitForElementToBeRemoved(modal);

      expect(modal).not.toBeInTheDocument();
    });

    it("should call onDeleteGroup when confirm button is clicked", async () => {
      expect.hasAssertions();

      const mockOnGroupInvite = vi.fn<() => Promise<void>>();
      const mockOnDeleteGroup = vi.fn<() => Promise<void>>();
      renderGroupHeader("Test-AdminId", mockOnGroupInvite, mockOnDeleteGroup);
      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockOnDeleteGroup).toHaveBeenCalledTimes(1);
    });

    it("should hide modal when confirm button is clicked", async () => {
      expect.hasAssertions();

      renderGroupHeader();
      const deleteButton = screen.getByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);
      const modal = screen.getByRole("dialog");
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);
      await waitForElementToBeRemoved(modal);

      expect(modal).not.toBeInTheDocument();
    });
  });
});
