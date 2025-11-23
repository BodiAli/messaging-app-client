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
});
