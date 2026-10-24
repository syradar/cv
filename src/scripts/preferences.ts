export const identities = ["nasa", "editorial", "neobrutalism"] as const;
export const appearances = ["light", "dark", "system"] as const;
export const validIdentity = (value: string | null) =>
  identities.find((item) => item === value) ?? "nasa";
export const validAppearance = (value: string | null) =>
  appearances.find((item) => item === value) ?? "light";

export function initializeSettings() {
  const root = document.documentElement;
  const menu = document.querySelector<HTMLDetailsElement>(".ds-controls");
  const sync = () => {
    document.querySelectorAll<HTMLInputElement>("[data-identity-option]").forEach((input) => {
      input.checked = input.value === root.dataset.identity;
    });
    document.querySelectorAll<HTMLInputElement>("[data-theme-option]").forEach((input) => {
      input.checked = input.value === root.dataset.theme;
    });
  };
  document
    .querySelectorAll<HTMLInputElement>("[data-identity-option], [data-theme-option]")
    .forEach((input) => {
      input.addEventListener("change", () => {
        const identity = input.hasAttribute("data-identity-option");
        const value = identity ? validIdentity(input.value) : validAppearance(input.value);
        root.dataset[identity ? "identity" : "theme"] = value;
        try {
          localStorage.setItem(identity ? "syr-identity" : "syr-theme", value);
        } catch {
          /* Preferences still work without storage. */
        }
        sync();
        const status = document.querySelector("[data-preference-status]");
        if (status) status.textContent = input.getAttribute("aria-label") ?? value;
      });
    });
  document.addEventListener("click", (event) => {
    if (menu?.open && event.target instanceof Node && !menu.contains(event.target))
      menu.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu?.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "syr-identity") root.dataset.identity = validIdentity(event.newValue);
    if (event.key === "syr-theme") root.dataset.theme = validAppearance(event.newValue);
    sync();
  });
  sync();
}
