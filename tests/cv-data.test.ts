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
          const items = value;
          for (const item of items) {
            visit(item);
          }
        } else if (value !== null && typeof value === "object") {
          const children = Object.values(value);
          for (const child of children) {
            visit(child);
          }
        }
      };

      visit(locale);
    }
  });

  it("keeps recruiter-focused role evidence and frontend skills", () => {
    expect(english.headline).toBe("Senior Frontend Engineer");
    expect(swedish.headline).toBe("Senior frontendutvecklare");
    const frontendSkills = english.skills.groups.flatMap((group) => group.items);
    for (const skill of ["TypeScript", "React", "Angular", "Vue.js", "Accessibility", "Vitest"]) {
      expect(frontendSkills).toContain(skill);
    }
    expect(english.experience.devcore.assignments[0].highlights).toHaveLength(4);
    expect(swedish.experience.devcore.assignments[0].highlights).toHaveLength(4);
    expect(english.experience.devcore.assignments[0].company).toContain("Confidential client");
    expect(swedish.experience.devcore.assignments[0].company).toContain("Konfidentiell kund");

    const removedSkills = new Set([
      "Software Development",
      "Documentation",
      "Artificial Intelligence (AI)",
      "Professional Mentoring",
      "Cross-functional Collaborations",
      "Front-End Development",
      "E-Commerce",
      "Python",
    ]);

    for (const locale of [english, swedish]) {
      const skills = locale.skills.groups.flatMap((group) => group.items);

      for (const removedSkill of removedSkills) {
        expect(skills).not.toContain(removedSkill);
      }
    }
  });
});
