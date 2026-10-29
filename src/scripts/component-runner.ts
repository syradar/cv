import { initializeAppearanceMenu } from "./appearance-menu"
import { noComponentCallbacks } from "./component-callbacks"
import type { ComponentCallbacks } from "./component-callbacks"
import { bindPrintAction } from "./print-action"
import { initializeNameEmoji } from "./name-emoji"
import { initializeNameWidth } from "./name-width"
import { initializeHeroPattern } from "./hero-pattern"
import { initializeGlider } from "./section-glider"

type ComponentInitializer = (element: HTMLElement, callbacks: ComponentCallbacks) => void

const componentRegistry: Record<string, ComponentInitializer> = {
  actions: (element, callbacks) => {
    const printButtons = element.querySelectorAll<HTMLButtonElement>("[data-print]")
    for (const button of printButtons) {
      bindPrintAction(button, callbacks.printPage)
    }
  },
  "appearance-menu": initializeAppearanceMenu,
  glider: initializeGlider,
  hero: (element) => {
    initializeNameWidth(element)
    initializeNameEmoji(element)
  },
  "hero-band": initializeHeroPattern,
}

export function resolveComponentInitializer(
  name: string,
  isStatic: boolean,
): ComponentInitializer | undefined {
  const initialize = componentRegistry[name]
  if (!initialize && !isStatic) {
    throw new Error(`No initializer registered for interactive component "${name}".`)
  }
  return initialize
}

export function callbacksForComponent(
  isStatic: boolean,
  callbacks: ComponentCallbacks,
): ComponentCallbacks {
  return isStatic ? noComponentCallbacks : callbacks
}

export function initializeComponent(
  element: HTMLElement,
  callbacks: ComponentCallbacks = noComponentCallbacks,
): void {
  const name = element.dataset.component
  if (!name) {
    throw new Error("A component root must have a data-component name.")
  }
  const isStatic = element.dataset.static === "true"
  const initialize = resolveComponentInitializer(name, isStatic)
  if (!initialize) {
    return
  }
  initialize(element, callbacksForComponent(isStatic, callbacks))
}

export function initializeComponents(
  root: ParentNode,
  callbacks: ComponentCallbacks = noComponentCallbacks,
): void {
  const components = root.querySelectorAll<HTMLElement>("[data-component]")
  for (const element of components) {
    initializeComponent(element, callbacks)
  }
}
