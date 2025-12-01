import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import renderWithProviders from "@/utils/test-utils";
import LoginPage from "@/pages/LoginPage";

describe("login-page component", () => {
  it("should render Log in to your account text", () => {
    expect.hasAssertions();

    renderWithProviders(<LoginPage />);

    expect(screen.getByRole("heading", { name: "Log in to your account", level: 1 })).toBeInTheDocument();
  });

  it("should render form", () => {
    expect.hasAssertions();

    renderWithProviders(<LoginPage />);

    const form = screen.getByRole("form", { name: "Login form" });

    expect(form).toBeInTheDocument();
  });

  it("should render username, password inputs and a Log in button", () => {
    expect.hasAssertions();

    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByRole("textbox", { name: "Username" });
    const passwordInput = screen.getByLabelText("Password");
    const logInButton = screen.getByRole("button", { name: "Log in" });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(logInButton).toBeInTheDocument();
  });

  it.todo("should render a validation message");
});
