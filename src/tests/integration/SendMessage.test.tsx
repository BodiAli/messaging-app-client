import { fireEvent, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, it, expect, afterEach, beforeEach, beforeAll } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";
import * as notistack from "notistack";
import userEvent from "@testing-library/user-event";
import SendMessage from "@/components/SendMessage";
import renderWithProviders from "@/utils/test-utils";
import ErrorBoundary from "@/components/ErrorBoundary";

const serverMessagesRoute = "/users/userId/messages";

function renderSendMessage() {
  const Stub = createRoutesStub([
    {
      ErrorBoundary,
      children: [
        {
          path: "/:userId",
          Component: () => <SendMessage />,
        },
      ],
    },
  ]);
  return renderWithProviders(<Stub initialEntries={["/userId"]} />);
}

describe("send-message component", () => {
  // resolve createObjectURL does not exist jsdom error
  if (typeof window.URL.createObjectURL === "undefined") {
    Object.defineProperty(window.URL, "createObjectURL", {
      value: () => {
        // empty
      },
      writable: true,
    });
  }

  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  beforeEach(() => {
    // resolve URL.createObjectURL is not a function jsdom error
    vi.spyOn(window.URL, "createObjectURL").mockImplementation(() => "url");
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("text input", () => {
    it("should render text input", () => {
      expect.hasAssertions();

      renderSendMessage();

      const textInput = screen.getByRole("textbox");

      expect(textInput).toBeInTheDocument();
    });

    it("should render text input as required", () => {
      expect.hasAssertions();

      renderSendMessage();

      const textInput = screen.getByRole("textbox");

      expect(textInput).toBeRequired();
    });
  });

  describe("attach button", () => {
    it("should render a button with an attach icon", () => {
      expect.hasAssertions();

      renderSendMessage();

      const attachImageButton = screen.getByRole("button", {
        name: "attach image",
      });
      const attachIcon =
        within(attachImageButton).getByTestId("AttachmentIcon");

      expect(attachImageButton).toBeInTheDocument();
      expect(attachIcon).toBeInTheDocument();
    });

    it("should render the uploaded image when an image is uploaded", async () => {
      expect.hasAssertions();

      renderSendMessage();
      const attachImageButton = screen.getByRole("button", {
        name: "attach image",
      });
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      await userEvent.upload(attachImageButton, file);
      const uploadedImage = screen.getByRole("img", {
        name: "uploaded image",
      });

      expect(uploadedImage).toBeInTheDocument();
    });

    it("should not render an uploaded image when simulating a 'cancel' click after uploading an image", async () => {
      expect.hasAssertions();

      renderSendMessage();
      const attachImageButton = screen.getByRole("button", {
        name: "attach image",
      });
      const file = new File(["hello"], "hello.png", { type: "image/png" });

      await userEvent.upload(attachImageButton, file);
      await userEvent.upload(attachImageButton, []);
      const uploadedImage = screen.queryByRole("img", {
        name: "uploaded image",
      });

      expect(uploadedImage).not.toBeInTheDocument();
    });
  });

  describe("submit form button", () => {
    it("should render a submit button with a send icon", () => {
      expect.hasAssertions();

      renderSendMessage();

      const sendButton = screen.getByRole<HTMLButtonElement>("button", {
        name: "send message",
      });
      const sendIcon = within(sendButton).getByTestId("SendIcon");

      expect(sendButton.type).toBe("submit");
      expect(sendButton).toBeInTheDocument();
      expect(sendIcon).toBeInTheDocument();
    });
  });

  describe("submitting form", () => {
    it("should call alert method when message field is empty", async () => {
      expect.hasAssertions();

      const mockAlert = vi
        .spyOn(window, "alert")
        .mockImplementation(() => null);
      renderSendMessage();
      const textInput = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: "send message" });

      await userEvent.type(textInput, " ");
      await userEvent.click(sendButton);

      expect(mockAlert).toHaveBeenCalledExactlyOnceWith(
        "Cannot send an empty message",
      );
    });

    it("should render ErrorBoundary when server responds with unexpected error", async () => {
      expect.hasAssertions();

      vi.spyOn(console, "error").mockImplementation(() => null);
      fetchMock.post(serverMessagesRoute, {
        status: 500,
        body: {
          error: "Server error",
        },
      });
      renderSendMessage();
      const textField = screen.getByRole("textbox");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const sendButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(textField, "Hello!");
      await userEvent.upload(
        attachButton,
        new File(["hello"], "hello.png", { type: "image/png" }),
      );
      await userEvent.click(sendButton);

      const errorBoundaryHeading = screen.getByRole("heading", {
        level: 1,
        name: "Unexpected error occurred",
      });
      const errorMessage = screen.getByText("Server error");

      expect(errorBoundaryHeading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    });

    it("should call 'enqueueSnackbar' on each client error", async () => {
      expect.hasAssertions();

      const mockEnqueueSnackbar = vi.fn<notistack.EnqueueSnackbar>();
      vi.spyOn(notistack, "useSnackbar").mockReturnValue({
        closeSnackbar: vi.fn<() => void>(),
        enqueueSnackbar: mockEnqueueSnackbar,
      });
      fetchMock.post(serverMessagesRoute, {
        status: 404,
        body: {
          errors: [{ message: "Cannot find user to send message to." }],
        },
      });
      renderSendMessage();
      const textField = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(textField, "message");
      await userEvent.click(sendButton);

      expect(mockEnqueueSnackbar).toHaveBeenCalledExactlyOnceWith(
        "Cannot find user to send message to.",
        { variant: "error" },
      );
    });

    it("should disable inputs while submitting", async () => {
      expect.hasAssertions();

      fetchMock.post(serverMessagesRoute, {
        status: 201,
      });
      renderSendMessage();
      const textField = screen.getByRole("textbox");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });
      await userEvent.type(textField, "message");

      fireEvent.click(submitButton);

      expect(textField).toBeDisabled();
      expect(attachButton).toHaveAttribute("aria-disabled", "true");
      expect(submitButton).toBeDisabled();
    });

    it.todo("should re-fetch messages on a successful post request");
  });
});
