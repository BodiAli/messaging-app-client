import { describe, it, expect } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import { createMemoryRouter, RouterProvider } from "react-router";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import * as localStorageService from "@/services/localStorage";

describe("signup page component", () => {
  it("should render 'create new account' heading", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, { initialEntries: ["/sign-up"] });

    renderWithProviders(<RouterProvider router={router} />);

    const heading = screen.getByRole("heading", {
      name: "Create a new account",
      level: 1,
    });

    expect(heading).toBeInTheDocument();
  });

  it("should render signup form with username, password, confirmPassword inputs, and create account button", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, { initialEntries: ["/sign-up"] });

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

  it("should render all inputs as required", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, { initialEntries: ["/sign-up"] });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);

    expect(usernameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it("should validate inputs on 'blur' event", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, { initialEntries: ["/sign-up"] });

    renderWithProviders(<RouterProvider router={router} />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText(/^Password/);
    const confirmPasswordInput = screen.getByLabelText(/^Confirm password/);

    await userEvent.type(usernameInput, "  ");
    await userEvent.type(passwordInput, "pas");
    await userEvent.type(confirmPasswordInput, "notMatchingPassword");

    const usernameError = screen.getByRole("listitem", {
      name: "Username cannot be empty.",
    });
    const passwordError = screen.getByRole("listitem", {
      name: "Password must be at least 5 characters.",
    });
    const confirmPasswordError = screen.getByRole("listitem", {
      name: "Passwords do not match.",
    });

    expect(usernameError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();
    expect(confirmPasswordError).toBeInTheDocument();
  });
});
