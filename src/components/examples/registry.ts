import ActionsExample from "./ActionsExample.astro";
import QuotationExample from "./QuotationExample.astro";
import RolesExample from "./RolesExample.astro";
import SkillsExample from "./SkillsExample.astro";
import SurfaceExample from "./SurfaceExample.astro";

export const examples = [
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
];
