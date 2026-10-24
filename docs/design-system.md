# CV design system

The English CV, Swedish CV, and English workshop at `/design-system/` use the same composition and component implementations. The workshop adds isolated examples after the CV; it does not maintain a separate copy of the CV markup.

## Styling contract

`global.css` declares the cascade order before importing any sheets:

`reset → tokens → identities → base → components → workshop → controls → print`

`primitives.css` owns raw palette values, font stacks, and spacing scales. Semantic `--syr-*` properties describe surfaces, foregrounds, hero treatment, typography, density, borders, corner radii, and elevation. `identities.css` supplies preset values and limited stylistic rules; components do not branch their markup on the selected identity. System fonts make each preset work without external font requests.

Root `data-identity` accepts `nasa`, `editorial`, or `neobrutalism`. Root `data-theme` independently accepts `light`, `dark`, or `system`. Both initialize before paint and persist through `syr-identity` and the existing `syr-theme` storage keys. Invalid values recover to Modern NASA/light. Storage failure leaves controls usable in the current document.

The settings and workshop captions have their own `--ui-*` values and explicit typography. They remain neutral in every identity and color mode. Cascade layers establish precedence; they do not isolate inherited custom properties. `@scope` is used only as an enhancement inside the controls.

## Shared components

- `Surface`: semantic container with default, nested, and accent variants.
- `Role`: primary employment or nested assignment, with shared date and description treatment.
- `Actions`: contact and print controls, including a disabled print state.
- `SkillList`: standard or prominent skill group.
- `Quotation`: recommendation and attribution.

The workshop renders one CV composition, keeping section anchors unique. Isolated components have no fixed IDs. The print action binds every enabled instance; disabled examples retain native disabled behavior.

## Validation

Run `vp check`, `vp test`, and `vp run build`. Use `vp run dev --background` to start Astro, and `vp run astro dev status`, `logs`, or `stop` to manage it.

Browser checks cover all three routes, all three identities, light/dark/system, and 320px/1280px widths. Check preference persistence, settings keyboard operation, contrast, print output, reduced motion, section links, and overflow when changing the system. Modern NASA's hero uses a deeper orange than the original to support readable small white text.

## Implementation verification

- `vp check`, `vp test` (4 tests), and `vp run build` pass.
- Browser matrix: 54 combinations across `/`, `/sv/`, `/design-system/`, three identities, three appearance preferences, and 320px/1280px widths. No horizontal overflow, broken fragment links, or duplicate IDs.
- Preference persistence between routes, neutral settings styling, Escape dismissal, and focus restoration checked in the browser.
- Representative text contrast measured across six light/dark identity palettes; all sampled ratios exceed 4.5:1. Modern NASA's deeper hero orange also accounts for the white pattern overlay.
- Print styles checked with isolated copies of built HTML/CSS, activating print rules at a 794px paper-width viewport. Six locale/identity combinations have white backgrounds, dark text, hidden controls, no overflow, and complete contact addresses. Temporary review fixtures were removed afterward.
- Native print invocation was exercised. The in-app browser cannot inspect the operating system's print sheet, so native pagination was not visually inspected.
