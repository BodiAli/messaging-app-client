import { describe, it, expect, beforeAll, afterEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";
import serverUrl from "@/utils/serverUrl";
import type { User } from "@/types/modelsType";

const serverRoute = `${serverUrl}/auth/sign-up`;

const mockedUser: User = {
  id: "userId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "username",
};

describe("signup page component", () => {
  const getJwtTokenSpy = vi.spyOn(localStorageService, "getJwtToken");
  const setJwtTokenSpy = vi.spyOn(localStorageService, "setJwtToken");

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render 'create new account' heading", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const heading = screen.getByRole("heading", {
      name: "Create a new account",
      level: 1,
    });

    expect(heading).toBeInTheDocument();
  });

  it("should render signup form with username, password, confirmPassword inputs, and create account button", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const signupForm = screen.getByRole("form", { name: "Sign up form" });
    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);
    const createAccountButton = screen.getByRole("button", {
      name: "Create account",
    });

    expect(signupForm).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(createAccountButton).toBeInTheDocument();
  });

  it("should render expected inputs' attributes", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);

    expect(usernameInput).toBeRequired();
    expect(usernameInput).toHaveAttribute("autocomplete", "username");
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it("should show validation errors on 'blur' event", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);

    /**
     * wait for focus and blur methods because react-hook-form validation is
     * executed asynchronously.
     * */
    await waitFor(async () => {
      usernameInput.focus();
      await userEvent.type(passwordInput, "pass");
      await userEvent.type(confirmPasswordInput, "notMatching");
      confirmPasswordInput.blur();
    });

    const usernameError = screen.getByText("Username cannot be empty.");
    const passwordError = screen.getByText(
      "Password must be at least 5 characters.",
    );
    const confirmPasswordError = screen.getByText("Passwords do not match.");

    expect(usernameError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
    expect(confirmPasswordError).toBeInTheDocument();
  });

  it("should remove validation errors when inputs are valid", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);

    await waitFor(async () => {
      usernameInput.focus();
      await userEvent.type(passwordInput, "pass");
      await userEvent.type(confirmPasswordInput, "notMatching");
      confirmPasswordInput.blur();
    });

    await userEvent.clear(confirmPasswordInput);
    await userEvent.clear(passwordInput);

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "password");
    await userEvent.type(confirmPasswordInput, "password");
    await waitFor(() => {
      confirmPasswordInput.blur();
    });

    const usernameError = screen.queryByText("Username cannot be empty.");
    const passwordError = screen.queryByText(
      "Password must be at least 5 characters.",
    );
    const confirmPasswordError = screen.queryByText("Passwords do not match.");

    expect(usernameError).not.toBeInTheDocument();
    expect(passwordError).not.toBeInTheDocument();
    expect(confirmPasswordError).not.toBeInTheDocument();
  });

  it("should render 4xx error messages returned by server in a list item", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    fetchMock.post(serverRoute, {
      status: 400,
      body: {
        errors: [{ message: "Username cannot be empty." }],
      },
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);
    const submitButton = screen.getByRole("button", {
      name: "Create account",
    });

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "password");
    await userEvent.type(confirmPasswordInput, "password");
    await userEvent.click(submitButton);

    const errorsList = screen.getByRole("list");
    const errorListItem = within(errorsList).getByRole("listitem");

    expect(errorListItem).toHaveTextContent("Username cannot be empty.");
  });

  it("should render ErrorBoundary when server responds with 500 status response", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    fetchMock.post(serverRoute, {
      status: 500,
      body: {
        error: { message: "Server error." },
      },
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);
    const submitButton = screen.getByRole("button", {
      name: "Create account",
    });

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "password");
    await userEvent.type(confirmPasswordInput, "password");
    await userEvent.click(submitButton);

    const errorBoundaryHeading = screen.getByRole("heading", {
      name: "Unexpected error occurred",
    });
    const errorMassage = screen.getByText("Server error.");

    expect(errorBoundaryHeading).toBeInTheDocument();
    expect(errorMassage).toBeInTheDocument();
  });

  it.only("should disable submit button on submit", async () => {
    expect.hasAssertions();

    fetchMock.post(
      serverRoute,
      {
        status: 200,
        body: { user: mockedUser, token: "jwtToken" },
      },
      { delay: 5000 },
    );

    const router = createMemoryRouter(routes, {
      initialEntries: ["/sign-up"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);
    const submitButton = screen.getByRole("button", {
      name: "Create account",
    });

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "password");
    await userEvent.type(confirmPasswordInput, "password");
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
