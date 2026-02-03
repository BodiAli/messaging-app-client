import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UsersAvatar from "@/components/UsersAvatar";

describe("user's-avatar component", () => {
  describe("given imageUrl is null", () => {
    it("should render default avatar", () => {
      expect.hasAssertions();

      render(<UsersAvatar imageUrl={null} username="mockUsername" />);

      const defaultImage = screen.getByTitle("mockUsername no profile picture");

      expect(defaultImage).toBeInTheDocument();
    });
  });

  describe("given imageUrl is not null", () => {
    it("should render avatar with expected text", () => {
      expect.hasAssertions();

      render(<UsersAvatar imageUrl={"imageUrl"} username="mockUsername" />);

      const profilePicture = screen.getByRole("img", {
        name: "mockUsername's profile picture",
      });

      expect(profilePicture).toBeInTheDocument();
    });
  });
});
