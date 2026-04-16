import { screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import {
  describe,
  it,
  beforeAll,
  beforeEach,
  afterEach,
  expect,
  assert,
} from "vitest";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import * as notistack from "notistack";
import * as localStorageService from "@/services/localStorage";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import serverUrl from "@/utils/serverUrl";
import type {
  GroupChat,
  GroupDetails,
  User,
  UserFriends,
} from "@/types/modelsType";
import type { ApiClientError } from "@/types/apiResponseTypes";

vi.mock(import("@/components/Header"), () => {
  return {
    default: () => <p>Mock: Header component</p>,
  };
});

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/pages/IndexPage"), () => {
  return {
    default: () => <p>Mock: Index page component</p>,
  };
});

vi.mock(import("@/pages/GroupsPage"), () => {
  return {
    default: () => <p>Mock: groups page component</p>,
  };
});

const serverGetUserRoute = `${serverUrl}/auth/get-user`;
const serverGroupRoute = `${serverUrl}/users/me/groups/Test-GroupId`;
const serverGroupInvitationsRoute = `${serverUrl}/users/me/groups/Test-GroupId/notifications`;
const serverDeleteGroupMember = `${serverUrl}/users/me/groups/Test-GroupId/members/Test-UserBId`;
const serverGetUserFriends = `${serverUrl}/users/me/friends`;

describe("group-details-page component", () => {
  const mockUserFriends: UserFriends = {
    friends: [
      {
        id: "Test-UserBId",
        imageUrl: "Test-UserBImageUrl",
        username: "Test: UserB username",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "Test-UserCId",
        imageUrl: "Test-UserCImageUrl",
        username: "Test: UserC username",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "Test-UserDId",
        imageUrl: "Test-UserDImageUrl",
        username: "Test: UserD username",
        lastSeen: new Date().toISOString(),
      },
    ],
  };

  const mockGroupDetails: GroupDetails = {
    group: {
      admin: {
        id: "Test-UserAId",
        imageUrl: "Test-UserAImageUrl",
        username: "Test: UserA username",
      },
      createdAt: "2020-01-01T01:30:30",
      id: "Test-GroupId",
      name: "Test: Group name",
      users: [
        {
          id: "Test-UserBId",
          imageUrl: "Test-UserBImageUrl",
          username: "Test: UserB username",
        },
      ],
    },
  };

  const mockCurrentUser: { user: User } = {
    user: {
      id: "Test-UserAId",
      imageUrl: null,
      isGuest: false,
      lastSeen: "2020-01-01T01:30:30",
      username: "Test: UserA username",
    },
  };

  const renderGroupDetails = () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/groups/Test-GroupId/details"],
    });
    return renderWithProviders(<RouterProvider router={router} />);
  };

  const manualFetchMock = (mutationResponseStatus: number) => {
    const { promise, resolve } = Promise.withResolvers();

    // mock for getting current user
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockCurrentUser), { status: 200 }),
    );

    // mock for getting user's friends
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockUserFriends), { status: 200 }),
    );

    // mock for getting group details
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockGroupDetails), { status: 200 }),
    );

    // mock for mutating group details
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => {
      await promise;

      return Promise.resolve(
        new Response(null, { status: mutationResponseStatus }),
      );
    });

    // mock for getting group details because mutating will invalidate cache
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockGroupDetails), { status: 200 }),
    );

    return resolve;
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue(
      "Test-jwtToken",
    );
    fetchMock.get(serverGetUserRoute, {
      status: 200,
      body: mockCurrentUser,
    });
    fetchMock.get(serverGetUserFriends, {
      status: 200,
      body: mockUserFriends,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("handling error responses for GET request to get group data", () => {
    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupRoute, {
        status: 500,
        body: {
          error: "Test: Server error",
        },
      });
      renderGroupDetails();

      const errorBoundaryHeading = await screen.findByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: Server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueueSnackbar when server responds with 404 status and navigate to homepage", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 404,
        body: {
          errors: [
            {
              message:
                "Group not found! it may have been moved, deleted or it might have never existed.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderGroupDetails();

      const homePageElement = await screen.findByText(
        "Mock: Index page component",
      );

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >(
        "Group not found! it may have been moved, deleted or it might have never existed.",
        { variant: "error" },
      );
      expect(homePageElement).toBeInTheDocument();
    });
  });

  describe("handling success response for sending a GET request to get group data", () => {
    it("should render fetched group data", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();

      const groupName = await screen.findByDisplayValue("Test: Group name");

      expect(groupName).toBeInTheDocument();
    });
  });

  describe("rendering only friends and non-members of the group inside the listbox", () => {
    it("should not render admin's friends that are already members of the group inside the listbox", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);

      const listbox = screen.getByRole("listbox", {
        name: "Invite friends",
      });
      const userB = within(listbox).queryByRole("option", {
        name: /Test: UserB username/,
      });

      expect(userB).not.toBeInTheDocument();
    });

    it("should render admin's friends that are not members of the group inside the listbox", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);

      const listbox = screen.getByRole("listbox", {
        name: "Invite friends",
      });

      const userC = within(listbox).getByRole("option", {
        name: /Test: UserC username/,
      });
      const userD = within(listbox).getByRole("option", {
        name: /Test: UserD username/,
      });

      expect(userC).toBeInTheDocument();
      expect(userD).toBeInTheDocument();
    });
  });

  describe("handling error responses for PATCH request to update group name", () => {
    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.patch(serverGroupRoute, {
        status: 500,
        body: {
          error: "Test: server error",
        },
      });
      renderGroupDetails();
      const groupNameInput =
        await screen.findByDisplayValue("Test: Group name");
      const updateNameButton = screen.getByRole("button", {
        name: "Update Name",
      });
      await userEvent.type(groupNameInput, "Test: updated group name");
      await userEvent.click(updateNameButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);
      const errorBoundaryHeading = screen.getByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueueSnackbar when server responds with 400 status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.patch(serverGroupRoute, {
        status: 400,
        body: {
          errors: [
            {
              message: "Test: Group name cannot be empty.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderGroupDetails();
      const groupNameInput =
        await screen.findByDisplayValue("Test: Group name");
      const updateNameButton = screen.getByRole("button", {
        name: "Update Name",
      });
      await userEvent.type(groupNameInput, "Test: updated group name");
      await userEvent.click(updateNameButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Test: Group name cannot be empty.", {
        variant: "error",
      });
    });
  });

  describe("handling success response for PATCH request to update group name", () => {
    it("should disable update name button while fetch request is loading", async () => {
      expect.hasAssertions();

      const resolvePromise = manualFetchMock(200);
      renderGroupDetails();
      const groupNameInput =
        await screen.findByDisplayValue("Test: Group name");
      const updateNameButton = screen.getByRole("button", {
        name: "Update Name",
      });

      await userEvent.type(groupNameInput, "Test: updated group name");
      await userEvent.click(updateNameButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(updateNameButton).toBeDisabled();

      resolvePromise(null);

      await waitFor(() => {
        expect(updateNameButton).toBeEnabled();
      });
    });

    it("should call enqueueSnackbar with a success message", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.patch(serverGroupRoute, {
        status: 200,
        body: {
          group: {
            adminId: "Test-UserAId",
            createdAt: new Date().toISOString(),
            id: "Test-GroupId",
            name: "Test: updated group name",
          },
        } satisfies { group: GroupChat },
      });
      renderGroupDetails();
      const groupNameInput =
        await screen.findByDisplayValue("Test: Group name");
      const updateNameButton = screen.getByRole("button", {
        name: "Update Name",
      });

      await userEvent.type(groupNameInput, "Test: updated group name");
      await userEvent.click(updateNameButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Group name updated successfully.", { variant: "success" });
    });

    it("should call fetch with expected arguments", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.patch(serverGroupRoute, {
        status: 200,
        body: {
          group: {
            adminId: "Test-UserAId",
            createdAt: new Date().toISOString(),
            id: "Test-GroupId",
            name: "Test: updated group name",
          },
        } satisfies { group: GroupChat },
      });
      renderGroupDetails();
      const groupNameInput =
        await screen.findByDisplayValue("Test: Group name");
      const updateNameButton = screen.getByRole("button", {
        name: "Update Name",
      });

      await userEvent.clear(groupNameInput);
      await userEvent.type(groupNameInput, "Test: updated group name");
      await userEvent.click(updateNameButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(fetchMock).toHavePatchedTimes(1, serverGroupRoute, {
        body: {
          groupName: "Test: updated group name",
        },
      });
    });
  });

  describe("handling error responses for POST request to invite friends to group", () => {
    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.post(serverGroupInvitationsRoute, {
        status: 500,
        body: {
          error: "Test: Server error",
        },
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);

      const userC = screen.getByRole("option", {
        name: /Test: UserC username/,
      });
      await userEvent.click(userC);
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(inviteButton);

      const errorBoundaryHeading = screen.getByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: Server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueueSnackbar when server responds with 4xx status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.post(serverGroupInvitationsRoute, {
        status: 403,
        body: {
          errors: [
            {
              message:
                "You do not have permission to invite users to this group.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderGroupDetails();

      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(openListBoxButton);

      const userC = screen.getByRole("option", {
        name: /Test: UserC username/,
      });
      await userEvent.click(userC);
      await userEvent.click(inviteButton);

      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
          [notistack.SnackbarMessage, notistack.OptionsObject]
        >("You do not have permission to invite users to this group.", {
          variant: "error",
        });
      });
    });
  });

  describe("handling success response for POST request to invite friends to group", () => {
    it("should disable invite friends input while inviting friends is loading", async () => {
      expect.hasAssertions();

      const resolvePromise = manualFetchMock(201);
      renderGroupDetails();
      const inviteInput = await screen.findByRole("combobox", {
        name: "Invite friends",
      });
      const openListBoxButton = screen.getByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);

      const userC = screen.getByRole("option", {
        name: /Test: UserC username/,
      });
      await userEvent.click(userC);
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(inviteButton);

      expect(inviteInput).toBeDisabled();

      resolvePromise(null);

      await waitFor(() => {
        expect(inviteInput).toBeEnabled();
      });
    });

    it("should call enqueueSnackbar when server responds with 201 status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.post(serverGroupInvitationsRoute, {
        status: 201,
        body: null,
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(openListBoxButton);
      const userC = screen.getByRole("option", {
        name: /Test: UserC username/,
      });
      await userEvent.click(userC);
      await userEvent.click(inviteButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Group invitation sent.", { variant: "success" });
    });

    it("should call fetch with an array of user ids", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);
      const userCOption = screen.getByRole("option", {
        name: /Test: UserC username/,
      });
      const userDOption = screen.getByRole("option", {
        name: /Test: UserD username/,
      });

      await userEvent.click(userCOption);
      await userEvent.click(userDOption);
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(inviteButton);
      assert(mockUserFriends.friends[1]);
      assert(mockUserFriends.friends[2]);
      const userC = mockUserFriends.friends[1];
      const userD = mockUserFriends.friends[2];

      expect(fetchMock).toHavePostedTimes(1, serverGroupInvitationsRoute, {
        body: {
          userIds: [userC.id, userD.id],
        },
      });
    });

    it("should call fetch with an array of user id when 1 user is invited", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();
      const openListBoxButton = await screen.findByRole("button", {
        name: "Open",
      });
      await userEvent.click(openListBoxButton);
      const userCOption = screen.getByRole("option", {
        name: /Test: UserC username/,
      });

      await userEvent.click(userCOption);
      const inviteButton = screen.getByRole("button", {
        name: "Send Invite",
      });
      await userEvent.click(inviteButton);
      assert(mockUserFriends.friends[1]);
      const userC = mockUserFriends.friends[1];

      expect(fetchMock).toHavePosted(serverGroupInvitationsRoute, {
        body: { userIds: [userC.id] },
      });
    });
  });

  describe("handling error responses for DELETE request to delete group", () => {
    it("should render ErrorBoundary when server responds with 5xx status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverGroupRoute, {
        status: 500,
        body: {
          error: "Test: server error",
        },
      });
      renderGroupDetails();
      const deleteButton = await screen.findByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);
      const errorBoundaryHeading = screen.getByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueueSnackbar when server responds with 4xx status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverGroupRoute, {
        status: 403,
        body: {
          errors: [
            {
              message: "Test: you do not have permission to delete this group.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderGroupDetails();
      const deleteButton = await screen.findByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Test: you do not have permission to delete this group.", {
        variant: "error",
      });
    });
  });

  describe("handling success response for DELETE request to delete group", () => {
    it("should disable delete button fetch request is pending", async () => {
      expect.hasAssertions();

      manualFetchMock(204);
      renderGroupDetails();
      const deleteButton = await screen.findByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(deleteButton).toBeDisabled();
    });

    it("should call enqueueSnackbar with a success message", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverGroupRoute, {
        status: 204,
      });
      renderGroupDetails();
      const deleteButton = await screen.findByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Group deleted successfully.", {
        variant: "success",
      });
    });

    it("should navigate to '/groups' route after delete", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverGroupRoute, {
        status: 204,
      });
      renderGroupDetails();
      const deleteButton = await screen.findByRole("button", {
        name: "Delete Group",
      });
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });
      await userEvent.click(confirmButton);
      const groupsPageComponentText = screen.getByText(
        "Mock: groups page component",
      );

      expect(groupsPageComponentText).toBeInTheDocument();
    });
  });

  describe("rendering group members", () => {
    it("should render group members", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();

      const userB = await screen.findByText("Test: UserB username");

      expect(userB).toBeInTheDocument();
    });
  });

  describe("disabling remove member button while DELETE request is pending for removing member", () => {
    it("should not disable remove member button while request is not pending", async () => {
      expect.hasAssertions();

      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      renderGroupDetails();

      const removeButton = await screen.findByRole("button", {
        name: "Remove Member",
      });

      expect(removeButton).toBeEnabled();
    });

    it("should disable remove member button while request is pending", async () => {
      expect.hasAssertions();

      const resolvePromise = manualFetchMock(204);
      renderGroupDetails();
      const removeButton = await screen.findByRole("button", {
        name: "Remove Member",
      });
      await userEvent.click(removeButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);

      expect(removeButton).toBeDisabled();

      resolvePromise(null);
      await waitFor(() => {
        expect(removeButton).toBeEnabled();
      });
    });
  });

  describe("handling error responses for DELETE request to remove group member", () => {
    it("should render ErrorBoundary when server responds with 500 status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverDeleteGroupMember, {
        status: 500,
        body: {
          error: "Test: server error",
        },
      });
      renderGroupDetails();
      const removeButton = await screen.findByRole("button", {
        name: "Remove Member",
      });
      await userEvent.click(removeButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);
      const errorBoundaryHeading = screen.getByRole("heading", {
        name: "Unexpected error occurred",
        level: 1,
      });
      const errorText = screen.getByText("Test: server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call enqueueSnackbar when server responds with 4xx status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverDeleteGroupMember, {
        status: 404,
        body: {
          errors: [
            {
              message: "Test: no member found to remove.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderGroupDetails();
      const removeButton = await screen.findByRole("button", {
        name: "Remove Member",
      });
      await userEvent.click(removeButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Test: no member found to remove.", {
        variant: "error",
      });
    });
  });

  describe("handling success response for DELETE request to remove group member", () => {
    it("should call enqueueSnackbar with success message", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.get(serverGroupRoute, {
        status: 200,
        body: mockGroupDetails,
      });
      fetchMock.delete(serverDeleteGroupMember, {
        status: 204,
      });
      renderGroupDetails();
      const removeButton = await screen.findByRole("button", {
        name: "Remove Member",
      });
      await userEvent.click(removeButton);
      const confirmButton = screen.getByRole("button", {
        name: "Confirm",
      });

      await userEvent.click(confirmButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >("Test: UserB username removed.", { variant: "success" });
    });
  });
});
