import { describe, it, expect, vi } from "vitest";
import { getJwtToken, setJwtToken } from "@/services/localStorage";

describe("localStorage service", () => {
  const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
  const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

  describe(getJwtToken, () => {
    it("should get 'token' key from localStorage", () => {
      expect.hasAssertions();

      const jwtToken = "jwtToken";

      localStorage.setItem("token", jwtToken);

      expect(getJwtToken()).toBe(jwtToken);
      expect(getItemSpy).toHaveBeenCalledWith("token");
    });
  });

  describe(setJwtToken, () => {
    it("should add a value to 'token' key in localStorage", () => {
      expect.hasAssertions();

      const jwtToken = "jwtToken";

      setJwtToken(jwtToken);

      expect(setItemSpy).toHaveBeenCalledWith("token", jwtToken);
      expect(getJwtToken()).toBe(jwtToken);
    });
  });
});
