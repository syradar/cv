import { syncAppearanceMenu } from "./appearance-menu"
import type { ComponentCallbacks } from "./component-callbacks"
import { validAppearance, validIdentity } from "./preferences"

export function initializePreferenceEffects(document: Document): ComponentCallbacks {
  const root = document.documentElement
  const view = document.defaultView

  if (!view) {
    throw new Error("Preference effects require a document with a window.")
  }

  let transitionTimer: number | undefined

  const setAppearance = (appearance: string | null) => {
    view.clearTimeout(transitionTimer)
    root.dataset.themeSwitching = "true"
    // Resolve the current palette before applying the new theme.
    void view.getComputedStyle(root).backgroundColor
    root.dataset.theme = validAppearance(appearance)
    transitionTimer = view.setTimeout(() => {
      delete root.dataset.themeSwitching
    }, 350)
  }

  const syncMenus = () => {
    const menus = document.querySelectorAll<HTMLElement>('[data-component="appearance-menu"]')

    for (const menu of menus) {
      syncAppearanceMenu(menu, root.dataset.identity ?? null, root.dataset.theme ?? null)
    }
  }
  const persist = (key: "syr-identity" | "syr-theme", value: string) => {
    try {
      view.localStorage.setItem(key, value)
    } catch {
      // Appearance changes still apply when browser storage is unavailable.
    }
  }

  view.addEventListener("storage", (event) => {
    if (event.key === "syr-identity") {
      root.dataset.identity = validIdentity(event.newValue)
    }
    if (event.key === "syr-theme") {
      setAppearance(event.newValue)
    }

    syncMenus()
  })

  return {
    setIdentity(identity) {
      root.dataset.identity = identity
      persist("syr-identity", identity)
      syncMenus()
    },
    setTheme(appearance) {
      setAppearance(appearance)
      persist("syr-theme", appearance)
      syncMenus()
    },
    printPage: () => view.print(),
  }
}
