interface MotionPermission {
  requestPermission?: () => Promise<"granted" | "denied">
}

export function patternDirection(x: number, y: number) {
  const length = Math.max(1, Math.hypot(x, y))

  return { x: x / length, y: y / length }
}

export function initializeHeroPattern(hero: HTMLElement): void {
  const view = hero.ownerDocument.defaultView
  const pattern = hero.querySelector<HTMLElement>(".syr-hero-pattern")

  if (!view || !pattern || hero.dataset.static === "true") {
    return
  }

  const owner = hero.closest<HTMLElement>("[data-identity]") ?? hero.ownerDocument.documentElement
  const reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)")
  const tiltButton = hero.querySelector<HTMLButtonElement>("[data-enable-tilt]")
  const orientation = (view as Window & { DeviceOrientationEvent?: MotionPermission })
    .DeviceOrientationEvent
  let target = { x: 0.4, y: 0.4 }
  let velocity = { ...target }
  let offset = { x: 0, y: 0 }
  let speed = 18
  let responseTime = 1.2
  let previous = 0
  let frame = 0
  let visible = true
  let neutral: { beta: number; gamma: number } | undefined

  const active = () =>
    visible &&
    !hero.ownerDocument.hidden &&
    !reducedMotion.matches &&
    (owner.dataset.identity ?? "nasa") === "nasa"
  const animate = (now: number) => {
    frame = 0

    if (!active()) {
      previous = 0
      return
    }

    const elapsed = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    const easing = 1 - Math.exp(-elapsed / responseTime)
    previous = now
    velocity.x += (target.x - velocity.x) * easing
    velocity.y += (target.y - velocity.y) * easing
    offset = {
      x: (offset.x + velocity.x * elapsed * speed) % 600,
      y: (offset.y + velocity.y * elapsed * speed) % 600,
    }
    pattern.style.setProperty("--pattern-x", `${offset.x}px`)
    pattern.style.setProperty("--pattern-y", `${offset.y}px`)
    frame = view.requestAnimationFrame(animate)
  }
  const resume = () => {
    if (active() && !frame) {
      frame = view.requestAnimationFrame(animate)
    }
  }

  hero.dataset.patternSteered = "true"
  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") {
      return
    }

    speed = 90
    responseTime = 0.45

    const rect = hero.getBoundingClientRect()
    target = patternDirection(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
    )
    resume()
  })
  hero.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") {
      return
    }

    speed = 18
    responseTime = 1.2
    target = { x: 0.4, y: 0.4 }
  })

  const listenForTilt = () => {
    view.addEventListener(
      "deviceorientation",
      (event) => {
        if (event.beta === null || event.gamma === null) {
          return
        }

        neutral ??= { beta: event.beta, gamma: event.gamma }
        const angle = ((view.screen.orientation?.angle ?? 0) * Math.PI) / 180
        const x = (event.gamma - neutral.gamma) / 12
        const y = (event.beta - neutral.beta) / 12
        speed = 72
        responseTime = 0.55
        target = patternDirection(
          x * Math.cos(angle) + y * Math.sin(angle),
          y * Math.cos(angle) - x * Math.sin(angle),
        )
        resume()
      },
      { passive: true },
    )
  }

  if (
    orientation?.requestPermission &&
    tiltButton &&
    view.matchMedia("(pointer: coarse)").matches
  ) {
    tiltButton.hidden = false
    tiltButton.addEventListener("click", async () => {
      try {
        const permission = await orientation.requestPermission?.()

        if (permission === "granted") {
          listenForTilt()
        }
      } catch {
        // Pointer steering and the default drift remain available.
      }

      tiltButton.hidden = true
    })
  } else if (orientation && !orientation.requestPermission) {
    listenForTilt()
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      visible = entry.isIntersecting
    }

    resume()
  })
  const identityObserver = new MutationObserver(resume)

  visibilityObserver.observe(hero)
  identityObserver.observe(owner, { attributes: true, attributeFilter: ["data-identity"] })
  reducedMotion.addEventListener("change", resume)
  hero.ownerDocument.addEventListener("visibilitychange", resume)
  resume()
}
