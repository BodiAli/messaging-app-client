import { createMemoryRouter, RouterProvider } from "react-router";
import { screen } from "@testing-library/react";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import renderWithProviders from "@/utils/test-utils";
import LoginPage from "@/pages/LoginPage";
import serverUrl from "@/utils/serverUrl";
import routes from "@/routes/routes";
import type { User } from "@/types/modelsType";

const serverRoute = `${serverUrl}/auth/log-in`;

const mockedUser: User = {
  id: "userId",
  imageUrl: null,
  isGuest: false,
  lastSeen: new Date().toDateString(),
  username: "mockUsername",
};

describe("login-page component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render Log in to your account text", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/log-in",
          Component: LoginPage,
        },
      ],
      { initialEntries: ["/log-in"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    expect(
      screen.getByRole("heading", { name: "Log in to your account", level: 1 }),
    ).toBeInTheDocument();
  });

  it("should render login form", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/log-in",
          Component: LoginPage,
        },
      ],
      { initialEntries: ["/log-in"] },
    );

    renderWithProviders(<RouterProvider router={router} />);
    const form = screen.getByRole("form", { name: "Login form" });

    expect(form).toBeInTheDocument();
  });

  it("should render username, password inputs and a Log in button", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/log-in",
          Component: LoginPage,
        },
      ],
      { initialEntries: ["/log-in"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const logInButton = screen.getByRole("button", { name: "Log in" });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(logInButton).toBeInTheDocument();
  });

  it("should mark username and password inputs as required", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/log-in",
          Component: LoginPage,
        },
      ],
      { initialEntries: ["/log-in"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it("should render a feedback message when log in fails", async () => {
    expect.hasAssertions();

    fetchMock.post(serverRoute, {
      status: 401,
      body: { errors: [{ message: "Incorrect username or password." }] },
    });

    const router = createMemoryRouter(
      [
        {
          path: "/log-in",
          Component: LoginPage,
        },
      ],
      { initialEntries: ["/log-in"] },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "invalidPassword");

    await userEvent.click(loginButton);

    const errorMessage = screen.getByText("Incorrect username or password.");

    expect(errorMessage).toBeVisible();
  });

  it("should render ErrorBoundary on server error", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => null);

    fetchMock.post(serverRoute, {
      status: 500,
      body: { error: { message: "Server error." } },
    });

    const router = createMemoryRouter(routes, { initialEntries: ["/log-in"] });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await userEvent.type(usernameInput, "username");
    await userEvent.type(passwordInput, "invalidPassword");

    await userEvent.click(loginButton);

    const errorBoundaryHeading = screen.getByRole("heading", {
      name: "Unexpected error occurred",
    });
    const errorMessage = screen.getByText("Server error.");

    expect(errorBoundaryHeading).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
  });

  it("should disable submit button while loading", async () => {
    expect.hasAssertions();

    fetchMock.post(
      serverRoute,
      {
        status: 200,
        body: { user: mockedUser },
      },
      { delay: 5000 },
    );

    const router = createMemoryRouter(routes, { initialEntries: ["/log-in"] });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await userEvent.type(usernameInput, "validUsername");
    await userEvent.type(passwordInput, "validPassword");

    await userEvent.click(loginButton);

    expect(loginButton).toBeDisabled();
  });

  it("should navigate to homepage when submitted with valid inputs", async () => {
    expect.hasAssertions();

    fetchMock.post(serverRoute, {
      status: 200,
      body: { user: mockedUser },
    });

    const router = createMemoryRouter(routes, { initialEntries: ["/log-in"] });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const loginButton = screen.getByRole("button", { name: "Log in" });

    await userEvent.type(usernameInput, "validUsername");
    await userEvent.type(passwordInput, "validPassword");

    await userEvent.click(loginButton);

    expect(router.state.location.pathname).toBe("/");
  });
});
