import { describe, it, beforeAll, afterEach, expect, beforeEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router";
import * as notistack from "notistack";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import type { User } from "@/types/modelsType";
import type { ApiClientError } from "@/types/apiResponseTypes";

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <Outlet />,
  };
});

vi.mock(import("@/components/Header"), () => {
  return {
    default: () => <p>Mock: header component</p>,
  };
});

describe("profile-page component", () => {
  const mockCurrentUser: { user: User } = {
    user: {
      id: "Test-UserA-Id",
      imageUrl: "Test-Image-Url",
      isGuest: false,
      lastSeen: new Date().toISOString(),
      username: "Test: userA username",
    },
  };

  const renderProfilePage = () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/profile"],
    });

    return renderWithProviders(<RouterProvider router={router} />);
  };

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    vi.spyOn(localStorageService, "getJwtToken").mockReturnValue("Mock-JWT");
    fetchMock.get("/auth/get-user", {
      status: 200,
      body: mockCurrentUser,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering current user's data", () => {
    it("should render current user's profile picture and username", async () => {
      expect.hasAssertions();

      renderProfilePage();

      const userAProfilePicture = await screen.findByRole("img", {
        name: "Test: userA username's profile picture",
      });
      const userAUsername = screen.getByRole("heading", {
        name: "Test: userA username",
      });

      expect(userAProfilePicture).toBeInTheDocument();
      expect(userAUsername).toBeInTheDocument();
    });
  });

  describe("rendering edit profile picture file input", () => {
    it("should render an edit profile picture file input", async () => {
      expect.hasAssertions();

      renderProfilePage();

      const editProfilePictureButton =
        await screen.findByLabelText<HTMLInputElement>("Edit profile picture");

      expect(editProfilePictureButton).toBeInTheDocument();
      expect(editProfilePictureButton.type).toBe("file");
    });
  });

  describe("loading state for edit profile picture input", () => {
    it("should disable edit profile picture while request for updating profile picture is pending", async () => {
      expect.hasAssertions();

      const { promise } = Promise.withResolvers();
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ user: mockCurrentUser }), {
            status: 200,
          }),
        )
        .mockImplementationOnce(async () => {
          await promise;
          return new Response(JSON.stringify({ user: mockCurrentUser }), {
            status: 200,
          });
        });
      renderProfilePage();

      const editProfilePictureButton = await screen.findByLabelText(
        "Edit profile picture",
      );
      await userEvent.upload(
        editProfilePictureButton,
        new File(["file"], "test-updated-img.png", { type: "image/png" }),
      );

      expect(editProfilePictureButton).toBeDisabled();
    });

    it("should re-enable edit profile picture while request for updating profile picture is completed", async () => {
      expect.hasAssertions();

      const { promise, resolve } = Promise.withResolvers();
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ user: mockCurrentUser }), {
            status: 200,
          }),
        )
        .mockImplementationOnce(async () => {
          await promise;
          return new Response(JSON.stringify({ user: mockCurrentUser }), {
            status: 200,
          });
        });
      renderProfilePage();

      const editProfilePictureButton = await screen.findByLabelText(
        "Edit profile picture",
      );
      await userEvent.upload(
        editProfilePictureButton,
        new File(["file"], "test-updated-img.png", { type: "image/png" }),
      );
      resolve(null);

      await waitFor(() => {
        expect(editProfilePictureButton).toBeEnabled();
      });
    });
  });

  describe("handling error responses for PATCH request to update profile picture", () => {
    it("should render ErrorBoundary when server responds with 500 status", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.patch("/me", {
        status: 500,
        body: {
          error: "Test: server error",
        },
      });
      renderProfilePage();
      const editProfilePictureButton = await screen.findByLabelText(
        "Edit profile picture",
      );

      await userEvent.upload(
        editProfilePictureButton,
        new File([new Blob()], "test-updated-img"),
      );
      const errorBoundaryHeading = screen.getByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorText = screen.getByText("Test: server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorText).toBeInTheDocument();
    });

    it("should call mockEnqueueSnackbar when server responds with 4xx status", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<() => notistack.SnackbarKey>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.patch("/me", {
        status: 400,
        body: {
          errors: [
            {
              message: "Test: file must be of type image.",
            },
            {
              message: "Test: file cannot exceed 5MBs.",
            },
          ],
        } satisfies ApiClientError,
      });
      renderProfilePage();
      const editProfilePictureButton = await screen.findByLabelText(
        "Edit profile picture",
      );

      await userEvent.upload(
        editProfilePictureButton,
        new File([new Blob()], "test-updated-img"),
      );

      expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(2);
      expect(mockEnqueueSnackbar).toHaveBeenNthCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >(1, "Test: file must be of type image.", { variant: "error" });
      expect(mockEnqueueSnackbar).toHaveBeenNthCalledWith<
        [notistack.SnackbarMessage, notistack.OptionsObject]
      >(2, "Test: file cannot exceed 5MBs.", { variant: "error" });
    });
  });

  describe("handling success response for PATCH request to update profile picture", () => {
    it.todo("should call mockEnqueueSnackbar with success message");
  });
});
