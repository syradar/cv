import ActionsExample from "./ActionsExample.astro"
import ContactLinksExample from "./ContactLinksExample.astro"
import EntryExample from "./EntryExample.astro"
import HeroExample from "./HeroExample.astro"
import HighlightsExample from "./HighlightsExample.astro"
import LanguageListExample from "./LanguageListExample.astro"
import QuotationExample from "./QuotationExample.astro"
import RolesExample from "./RolesExample.astro"
import SectionExample from "./SectionExample.astro"
import SkillsExample from "./SkillsExample.astro"
import SurfaceExample from "./SurfaceExample.astro"

type Example = {
  id: string
  title: string
  description: string
  Component: import("astro/runtime/server/index.js").AstroComponentFactory
}

export const examples: Example[] = [
  {
    id: "hero",
    title: "Hero and navigation",
    description:
      "The actual CV hero, language links, appearance menu, actions and section navigation.",
    Component: HeroExample,
  },
  {
    id: "section",
    title: "Section",
    description: "A CV section heading and its content using the shared section component.",
    Component: SectionExample,
  },
  {
    id: "surface",
    title: "Surface",
    description: "The syr-card in its default, nested and accent variants.",
    Component: SurfaceExample,
  },
  {
    id: "actions",
    title: "Actions",
    description: "Contact link, print action, and disabled state. Hover or focus to inspect.",
    Component: ActionsExample,
  },
  {
    id: "roles",
    title: "Surfaces and roles",
    description: "Primary content and nested client assignments.",
    Component: RolesExample,
  },
  {
    id: "entry",
    title: "Entries",
    description: "Education entry and a role rendered with the production components.",
    Component: EntryExample,
  },
  {
    id: "highlights",
    title: "Experience highlights",
    description: "The assignment highlights used within a nested role.",
    Component: HighlightsExample,
  },
  {
    id: "skills",
    title: "Skill lists",
    description: "Emphasized skills and a standard group.",
    Component: SkillsExample,
  },
  {
    id: "quotation",
    title: "Typography and quotation",
    description: "Long-form content, attribution, and secondary text.",
    Component: QuotationExample,
  },
  {
    id: "contact-links",
    title: "Contact links",
    description: "The CV's actual contact methods and hover/focus states.",
    Component: ContactLinksExample,
  },
  {
    id: "language-list",
    title: "Language list",
    description: "The language and proficiency list from the CV.",
    Component: LanguageListExample,
  },
]
