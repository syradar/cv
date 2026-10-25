import { validAppearance, validIdentity } from "./preferences";
import type { ComponentCallbacks } from "./component-callbacks";

export function applyPreferenceChoice(
  kind: "identity" | "theme",
  value: string,
  callbacks: ComponentCallbacks,
): void {
  if (kind === "identity") {
    callbacks.setIdentity(validIdentity(value));
  } else {
    callbacks.setTheme(validAppearance(value));
  }
}

export function syncAppearanceMenu(
  menu: HTMLElement,
  identity: string | null,
  appearance: string | null,
): void {
  const identityOptions = menu.querySelectorAll<HTMLInputElement>("[data-identity-option]");
  for (const input of identityOptions) {
    input.checked = input.value === validIdentity(identity);
  }
  const themeOptions = menu.querySelectorAll<HTMLInputElement>("[data-theme-option]");
  for (const input of themeOptions) {
    input.checked = input.value === validAppearance(appearance);
  }
}

export function initializeAppearanceMenu(menu: HTMLElement, callbacks: ComponentCallbacks): void {
  if (!(menu instanceof HTMLDetailsElement)) {
    throw new Error("The appearance-menu component must use a details element.");
  }
  const owner =
    menu.closest<HTMLElement>("[data-identity][data-theme]") ?? menu.ownerDocument.documentElement;
  const scope = owner.dataset.identity ?? "site";
  const preferenceInputs = menu.querySelectorAll<HTMLInputElement>(
    "[data-identity-option], [data-theme-option]",
  );
  for (const input of preferenceInputs) {
    input.name = `${input.name}-${scope}`;
  }
  syncAppearanceMenu(menu, owner.dataset.identity ?? null, owner.dataset.theme ?? null);

  for (const input of preferenceInputs) {
    input.addEventListener("change", () => {
      const kind = input.hasAttribute("data-identity-option") ? "identity" : "theme";
      applyPreferenceChoice(kind, input.value, callbacks);
      const status = menu.querySelector<HTMLElement>("[data-preference-status]");
      if (status) status.textContent = input.getAttribute("aria-label") ?? input.value;
    });
  }

  const document = menu.ownerDocument;
  document.addEventListener("click", (event) => {
    if (menu.open && event.target instanceof Node && !menu.contains(event.target)) {
      menu.open = false;
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector<HTMLElement>("[data-appearance-trigger]")?.focus();
    }
  });
}
