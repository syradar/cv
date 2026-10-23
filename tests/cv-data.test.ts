import { describe, expect, it } from "vite-plus/test";
import english from "../src/data/cv.en.json";
import swedish from "../src/data/cv.sv.json";

const keysOf = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(keysOf);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, keysOf(child)]));
  }
  return typeof value;
};

describe("CV locale data", () => {
  it("keeps English and Swedish content structurally in sync", () => {
    expect(keysOf(swedish)).toEqual(keysOf(english));
  });

  it("has non-empty localized text throughout both CVs", () => {
    for (const locale of [english, swedish]) {
      const visit = (value: unknown): void => {
        if (typeof value === "string") {
          expect(value.trim().length).toBeGreaterThan(0);
        } else if (Array.isArray(value)) {
          value.forEach(visit);
        } else if (value !== null && typeof value === "object") {
          Object.values(value).forEach(visit);
        }
      };
      visit(locale);
    }
  });
});
