import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import renderWithProviders from "@/utils/test-utils";
import Notifications from "@/components/Notifications";

vi.mock(import("@/app/MainLayout"), () => {
  return {
    default: () => <p>Main Layout</p>,
  };
});

function assertIsElement(val: unknown): asserts val is Element {
  if (!(val instanceof Element)) throw new Error("Not an element");
}

describe("notifications component", () => {
  const onClose = vi.fn<() => void>();
  const anchorElement = document.createElement("button");

  it("should render Menu when open is true", () => {
    expect.hasAssertions();

    renderWithProviders(
      <Notifications open anchorElement={anchorElement} onClose={onClose} />,
    );

    const menu = screen.getByRole("menu");

    expect(menu).toBeInTheDocument();
  });

  it("should not render Menu when open is false", () => {
    expect.hasAssertions();

    renderWithProviders(
      <Notifications
        open={false}
        anchorElement={anchorElement}
        onClose={onClose}
      />,
    );

    const menu = screen.queryByRole("menu");

    expect(menu).not.toBeInTheDocument();
  });

  it("should call onClose function when clicking away", async () => {
    expect.hasAssertions();

    renderWithProviders(
      <Notifications
        open={true}
        anchorElement={anchorElement}
        onClose={onClose}
      />,
    );

    const menuBackdrop = screen.getByRole("presentation").firstChild;
    assertIsElement(menuBackdrop);
    await userEvent.click(menuBackdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.todo("should render 'No current notifications' when data length is 0");
});
