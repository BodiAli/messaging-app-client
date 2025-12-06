import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

describe("header component", () => {
  it("should render website name and logo", () => {
    expect.hasAssertions();

    render(<Header />);

    expect(
      screen.getByRole("heading", { name: "Messaging App", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Messaging App Logo" }),
    ).toBeInTheDocument();
  });
});
