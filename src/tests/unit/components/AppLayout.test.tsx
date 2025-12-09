import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import renderWithProviders from "@/utils/test-utils";
import AppLayout from "@/app/AppLayout";

describe("app-layout component", () => {
  it("should render Header component and whatever component passed as children", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          Component: AppLayout,
          children: [
            {
              path: "/test",
              Component: () => <h3>Test</h3>,
            },
          ],
        },
      ],
      {
        initialEntries: ["/test"],
      },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const headerComponentHeading = screen.getByRole("heading", {
      level: 2,
      name: "Messaging App",
    });
    const testHeading = screen.getByRole("heading", { level: 3, name: "Test" });

    expect(headerComponentHeading).toBeInTheDocument();
    expect(testHeading).toBeInTheDocument();
  });
});
