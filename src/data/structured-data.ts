import type english from "./cv.en.json"
import source from "./cv.en.json"

type CV = typeof english

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function toIsoMonth(value: string): string {
  const [month, year] = value.split(" ")
  const monthIndex = months.indexOf(month.slice(0, 3))

  if (monthIndex < 0 || !/^\d{4}$/.test(year)) {
    throw new Error(`Invalid CV month: ${value}`)
  }

  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`
}

export function createProfileStructuredData(cv: CV, locale: "en" | "sv", origin: URL) {
  const absolute = (path: string) => new URL(path, origin).href
  const pageUrl = absolute(locale === "sv" ? "/sv/" : "/")
  const personId = absolute("/#person")
  const employeeKeys = ["devcore", "rightGrafiska"] as const
  const organizations = employeeKeys.map((key) => {
    const job = cv.experience[key]
    const dates = source.experience[key].dates

    return {
      "@type": "Organization",
      "@id": absolute(`/#employer-${key}`),
      name: job.company,
      employee: {
        "@type": "EmployeeRole",
        roleName: job.title,
        startDate: toIsoMonth(dates.start),
        ...(dates.end === "current" ? {} : { endDate: toIsoMonth(dates.end) }),
        employee: { "@id": personId },
      },
    }
  })
  const skills = cv.skills.groups.flatMap((group) => group.items)
  const person = {
    "@type": "Person",
    "@id": personId,
    name: cv.plainName,
    url: absolute("/"),
    jobTitle: cv.headline,
    description: cv.summary,
    email: cv.contact.email,
    sameAs: [cv.contact.linkedin, cv.contact.github],
    address: { "@type": "PostalAddress", addressLocality: "Stockholm", addressCountry: "SE" },
    worksFor: { "@id": absolute("/#employer-devcore") },
    knowsAbout: skills,
    knowsLanguage: cv.languages.map((language) => ({ "@type": "Language", name: language.name })),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      name: cv.certification.name,
      credentialCategory: "Professional certification",
      publisher: { "@type": "Organization", name: cv.certification.issuer },
      dateCreated: toIsoMonth(source.certification.issued),
    },
    hasOccupation: [
      {
        "@type": "Occupation",
        name: cv.headline,
        description: cv.summary,
        skills,
        occupationLocation: { "@type": "Country", name: "Sweden" },
      },
      {
        "@type": "Role",
        roleName: cv.experience.freelance.title,
        startDate: toIsoMonth(source.experience.freelance.dates.start),
        endDate: toIsoMonth(source.experience.freelance.dates.end),
        hasOccupation: {
          "@type": "Occupation",
          name: cv.experience.freelance.title,
          description: cv.experience.freelance.description,
        },
      },
    ],
    subjectOf: (["en", "sv"] as const).map((language) => ({
      "@type": "DigitalDocument",
      "@id": absolute(`/cv-david-malmstrom-${language}.pdf`),
      name: `${cv.plainName} — CV (${language})`,
      url: absolute(`/cv-david-malmstrom-${language}.pdf`),
      encodingFormat: "application/pdf",
      inLanguage: language,
      about: { "@id": personId },
      author: { "@id": personId },
    })),
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        inLanguage: locale,
        mainEntity: { "@id": personId },
      },
      person,
      ...organizations,
    ],
  }
}
