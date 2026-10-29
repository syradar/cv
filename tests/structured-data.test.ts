import { describe, expect, it } from "vite-plus/test"
import english from "../src/data/cv.en.json"
import swedish from "../src/data/cv.sv.json"
import { createProfileStructuredData, toIsoMonth } from "../src/data/structured-data"

describe("CV structured data", () => {
  it("keeps month precision without inventing days", () => {
    expect(toIsoMonth("May 2018")).toBe("2018-05")
    expect(toIsoMonth("July 2026")).toBe("2026-07")
    expect(() => toIsoMonth("current")).toThrow("Invalid CV month")
  })

  it("shares person identity across localized pages and PDF documents", () => {
    const locales = [
      { locale: "en", cv: english },
      { locale: "sv", cv: swedish },
    ] as const

    for (const { locale, cv } of locales) {
      const data = createProfileStructuredData(cv, locale, new URL("https://syradar.se"))
      const person = data["@graph"].find((node) => node["@type"] === "Person")

      expect(person).toMatchObject({
        "@id": "https://syradar.se/#person",
        jobTitle: cv.headline,
        hasCredential: { name: "GitHub Copilot", dateCreated: "2026-07" },
        subjectOf: [
          { inLanguage: "en", url: "https://syradar.se/cv-david-malmstrom-en.pdf" },
          { inLanguage: "sv", url: "https://syradar.se/cv-david-malmstrom-sv.pdf" },
        ],
      })
      expect(data["@graph"][0]).toMatchObject({
        inLanguage: locale,
        mainEntity: { "@id": "https://syradar.se/#person" },
      })
      expect(data["@graph"]).toContainEqual(
        expect.objectContaining({
          "@id": "https://syradar.se/#employer-devcore",
          employee: {
            "@type": "EmployeeRole",
            roleName: cv.experience.devcore.title,
            startDate: "2018-05",
            employee: { "@id": "https://syradar.se/#person" },
          },
        }),
      )
      expect(data["@graph"]).toContainEqual(
        expect.objectContaining({
          "@id": "https://syradar.se/#employer-rightGrafiska",
          employee: expect.objectContaining({ startDate: "2017-08", endDate: "2018-03" }),
        }),
      )
    }
  })
})
