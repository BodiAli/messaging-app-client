import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import routes from "@/routes/routes";
import renderWithProviders from "@/utils/test-utils";
import NotFoundPage from "@/pages/NotFoundPage";

describe("notfound-page component", () => {
  it("should render 404 not found heading and a home page link", () => {
    expect.hasAssertions();

    const router = createMemoryRouter(routes, {
      initialEntries: ["/not-found"],
    });

    renderWithProviders(<RouterProvider router={router} />);

    const notFoundHeading = screen.getByRole("heading", {
      name: "404 Not Found",
      level: 1,
    });
    const homePageParagraph = screen.getByText((_content, element) => {
      return element?.textContent === "Click here to return to Home page";
    });
    const homePageLink = screen.getByRole("link", {
      name: "here",
    });

    expect(notFoundHeading).toBeInTheDocument();
    expect(homePageParagraph).toBeInTheDocument();
    expect(homePageLink).toBeInTheDocument();
  });

  it("should return to home page when home link is clicked", async () => {
    expect.hasAssertions();

    const router = createMemoryRouter(
      [
        {
          path: "/",
          Component: () => <h1>Main page</h1>,
        },
        {
          path: "*",
          Component: NotFoundPage,
        },
      ],
      {
        initialEntries: ["/not-found"],
      },
    );

    renderWithProviders(<RouterProvider router={router} />);

    const homePageLink = screen.getByRole("link", {
      name: "here",
    });

    await userEvent.click(homePageLink);

    expect(router.state.location.pathname).toBe("/");
    expect(
      screen.getByRole("heading", { name: "Main page", level: 1 }),
    ).toBeInTheDocument();
  });
});
