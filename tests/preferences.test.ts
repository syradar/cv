import { describe, expect, it } from "vite-plus/test";
import { validAppearance, validIdentity } from "../src/scripts/preferences";

describe("saved display preferences", () => {
  it("retains existing color preferences independently of the identity", () => {
    for (const appearance of ["light", "dark", "system"]) {
      expect(validAppearance(appearance)).toBe(appearance);
      expect(validIdentity(null)).toBe("nasa");
    }
  });

  it("recovers from stale or malformed saved settings", () => {
    for (const value of [null, "", "old-brand", "constructor", "DARK"]) {
      expect(validIdentity(value)).toBe("nasa");
      expect(validAppearance(value)).toBe("light");
    }
  });
});
