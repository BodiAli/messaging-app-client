import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import renderWithProviders from "@/utils/test-utils";
import Notifications from "@/components/Notifications";
import serverUrl from "@/utils/serverUrl";

const notificationsRoute = `${serverUrl}/notifications/me`;

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

  function renderNotificationsComponent() {
    return renderWithProviders(
      <Notifications
        open={true}
        onClose={onClose}
        anchorElement={anchorElement}
      />,
    );
  }

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render Menu when open is true", async () => {
    expect.hasAssertions();

    renderWithProviders(
      <Notifications open anchorElement={anchorElement} onClose={onClose} />,
    );

    const menu = await screen.findByRole("menu");

    expect(menu).toBeInTheDocument();
  });

  it("should not render Menu when open is false", async () => {
    expect.hasAssertions();

    renderWithProviders(
      <Notifications
        open={false}
        anchorElement={anchorElement}
        onClose={onClose}
      />,
    );

    await waitForElementToBeRemoved(screen.getByTestId("loader"));
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

    const menuBackdrop = (await screen.findByRole("presentation")).firstChild;
    assertIsElement(menuBackdrop);
    await userEvent.click(menuBackdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should render 'No current notifications' when data length is 0", async () => {
    expect.hasAssertions();

    fetchMock.get(notificationsRoute, {
      status: 200,
      body: {
        notifications: [],
      },
    });
    renderNotificationsComponent();

    const emptyText = await screen.findByText("No current notifications");

    expect(emptyText).toBeInTheDocument();
  });
});
