import { screen, within } from "@testing-library/react";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import SendMessage from "@/components/SendMessage";
import renderWithProviders from "@/utils/test-utils";

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

      renderWithProviders(<SendMessage />);

      const textInput = screen.getByRole("textbox");

      expect(textInput).toBeInTheDocument();
    });

    it("should render text input as required", () => {
      expect.hasAssertions();

      renderWithProviders(<SendMessage />);

      const textInput = screen.getByRole("textbox");

      expect(textInput).toBeRequired();
    });
  });

  describe("attach button", () => {
    it("should render a button with an attach icon", () => {
      expect.hasAssertions();

      renderWithProviders(<SendMessage />);

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

      renderWithProviders(<SendMessage />);
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

      renderWithProviders(<SendMessage />);
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

      renderWithProviders(<SendMessage />);

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
    it("should call alert method with expected arguments", async () => {
      expect.hasAssertions();

      const mockAlert = vi
        .spyOn(window, "alert")
        .mockImplementation(() => null);
      renderWithProviders(<SendMessage />);
      const textInput = screen.getByRole("textbox");
      const sendButton = screen.getByRole("button", { name: "send message" });

      await userEvent.type(textInput, " ");
      await userEvent.click(sendButton);

      expect(mockAlert).toHaveBeenCalledExactlyOnceWith(
        "Cannot send an empty message",
      );
    });
  });
});
