import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import renderWithProviders from "@/utils/test-utils";
import IndexPage from "@/pages/IndexPage";
import type { User } from "@/types/modelsType";

describe("index-page-component", () => {
  const mockUser: User = {
    id: "userId",
    imageUrl: "imageUrl",
    isGuest: false,
    lastSeen: "2020-01-01T01:30:00",
    username: "mockUsername",
  };

  const renderWithState = () => {
    return renderWithProviders(<IndexPage />, {
      preloadedState: {
        auth: {
          user: mockUser,
          loading: false,
        },
      },
    });
  };

  describe("rendering h1 component", () => {
    it("should render an h1 component with a welcome text", () => {
      expect.hasAssertions();

      renderWithState();

      const headingElement = screen.getByRole("heading", { level: 1 });

      expect(headingElement).toHaveTextContent("Welcome mockUsername");
    });
  });

  describe("rendering user profile picture", () => {
    it("should render user profile picture", () => {
      expect.hasAssertions();

      renderWithState();

      const profilePicture = screen.getByRole("img", {
        name: "mockUsername's profile picture",
      });

      expect(profilePicture).toBeInTheDocument();
    });
  });

  describe("rendering description", () => {
    it("should render a headline of the app", () => {
      expect.hasAssertions();

      renderWithState();

      const headline = screen.getByRole("paragraph");

      expect(headline).toHaveTextContent(
        "Chat with people all around the world.",
      );
    });
  });
});
