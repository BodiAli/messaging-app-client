import { screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, it, expect, afterEach, beforeEach, beforeAll } from "vitest";
import userEvent from "@testing-library/user-event";
import SendMessage from "@/components/SendMessage";
import renderWithProviders from "@/utils/test-utils";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { Dispatch, SetStateAction, SubmitEvent } from "react";

function renderSendMessage(
  onSubmit: (
    setUploadedImageUrl: Dispatch<SetStateAction<string | null>>,
  ) => (e: SubmitEvent<HTMLFormElement>) => void = vi.fn<
    (setUploadedImageUrl: Dispatch<SetStateAction<string | null>>) => () => void
  >(),
  isLoading = false,
) {
  const Stub = createRoutesStub([
    {
      ErrorBoundary,
      children: [
        {
          path: "/:userId",
          Component: () => (
            <SendMessage onSubmit={onSubmit} isLoading={isLoading} />
          ),
        },
      ],
    },
  ]);
  return renderWithProviders(<Stub initialEntries={["/userId"]} />);
}

describe("send-message component", () => {
  beforeAll(() => {
    // resolve createObjectURL does not exist jsdom error
    Object.defineProperty(window.URL, "createObjectURL", {
      value: () => {
        // empty
      },
      writable: true,
    });
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
    it("should disable inputs when loading is true", () => {
      expect.hasAssertions();

      renderSendMessage(vi.fn(), true);
      const textField = screen.getByRole("textbox");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      expect(textField).toBeDisabled();
      expect(attachButton).toHaveAttribute("aria-disabled", "true");
      expect(submitButton).toBeDisabled();
    });

    it("should not disable inputs when loading is false", () => {
      expect.hasAssertions();

      renderSendMessage(vi.fn(), false);
      const textField = screen.getByRole("textbox");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      expect(textField).toBeEnabled();
      expect(attachButton).not.toHaveAttribute("aria-disabled", "true");
      expect(submitButton).toBeEnabled();
    });

    it("should call onSubmit with expected arguments", async () => {
      expect.hasAssertions();

      const mockOnSubmit = vi.fn<
        (
          setUploadedImageUrl: Dispatch<SetStateAction<string | null>>,
        ) => (e: SubmitEvent<HTMLFormElement>) => void
      >(() => (e) => {
        e.preventDefault();
      });
      renderSendMessage(mockOnSubmit, false);
      const textField = screen.getByRole("textbox");
      const attachButton = screen.getByRole("button", {
        name: "attach image",
      });
      const submitButton = screen.getByRole("button", {
        name: "send message",
      });

      await userEvent.type(textField, "message content");
      await userEvent.upload(
        attachButton,
        new File(["hello"], "file.txt", { type: "image/png" }),
      );
      await userEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
