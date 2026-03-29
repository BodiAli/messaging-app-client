import { describe, it, vi, beforeAll, afterEach } from "vitest";
import fetchMock, { manageFetchMockGlobally } from "@fetch-mock/vitest";

const serverGetGroupChat = "/users/me/groups/groupId/messages";

describe("group-chat-page component", () => {
  beforeAll(() => {
    fetchMock.mockGlobal();
    manageFetchMockGlobally();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("rendering group chat data", () => {
    it.todo(
      "should render ErrorBoundary when the server responds with a 500 status",
    );
  });
});
