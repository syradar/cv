import { createMarbleBag } from "./marble-bag"

export function getEmojiCharge(heldMs: number) {
  const power = Math.max(0, Math.min(1, heldMs / 1000))

  return { power, scale: 1 + (0.4 - 1) * power }
}

export function getEmojiDrag(x: number, y: number) {
  const distance = Math.hypot(x, y)
  const follow = distance > 0 ? Math.min(0.3, 72 / distance) : 0.3

  return {
    x: x * follow,
    y: y * follow,
    angle: distance < 8 ? -Math.PI / 2 : Math.atan2(-y, -x),
  }
}

export function initializeNameEmoji(hero: HTMLElement): void {
  const emoji = hero.querySelector<HTMLElement>(".syr-name-emoji")
  const view = hero.ownerDocument.defaultView

  if (!emoji || !view) {
    return
  }

  const document = hero.ownerDocument
  const hint = emoji.querySelector<HTMLElement>(".syr-emoji-hint")
  const original = emoji.firstChild?.textContent ?? "✌️"
  const glyph = document.createElement("button")
  const face = document.createElement("span")
  const reducedMotion = view.matchMedia("(prefers-reduced-motion: reduce)")
  const alternatives = [
    "🎉",
    "💩",
    "⭐️",
    "🤓",
    "✌️",
    "🫰",
    "👏",
    "👋",
    "🤙",
    "🧑‍💻",
    "🧙‍♂️",
    "💅",
    "👑",
    "🦄",
    "🔥",
    "🌈",
    "⚡️",
    "🌮",
    "☕️",
    "🚀",
    "🚧",
    "💎",
    "🔮",
    "🎈",
    "‼️",
    "🔊",
    "🇸🇪",
    "🧘",
  ]
  const bag = createMarbleBag(alternatives, { previous: original })
  const particles = new Set<HTMLElement>()
  let reminderDelay = 2000
  let reminderCount = 0
  let pointer: number | undefined
  let introTimer: number | undefined
  let hintTimer: number | undefined
  let reminderTimer: number | undefined
  let wiggle: Animation | undefined
  let releaseAnimation: Animation | undefined
  let pressed = false
  let hovered = false
  let interacted = false
  let holdStarted: number | undefined
  let chargeFrame: number | undefined
  let pointerStart = { x: 0, y: 0 }
  let drag = getEmojiDrag(0, 0)

  glyph.type = "button"
  glyph.className = "syr-emoji-glyph"
  face.className = "syr-emoji-face"
  glyph.append(face)
  face.textContent = bag.next().value
  glyph.setAttribute(
    "aria-label",
    document.documentElement.lang === "sv" ? "Skjut emojikonfetti" : "Launch emoji confetti",
  )
  emoji.removeAttribute("aria-hidden")
  emoji.replaceChildren(glyph)

  if (hint) {
    emoji.append(hint)
  }

  const syncAnticipation = () => {
    const atDragLimit = Math.hypot(drag.x, drag.y) >= 71.99
    const idleHover =
      hovered && !pressed && holdStarted === undefined && releaseAnimation?.playState !== "running"
    let anticipation = "none"

    if (!reducedMotion.matches) {
      if (pressed && atDragLimit) {
        anticipation = "drag"
      } else if (idleHover) {
        anticipation = "hover"
      }
    }

    face.dataset.anticipating = anticipation
  }

  const chargeTransform = (scale: number) => `translate(${drag.x}px, ${drag.y}px) scale(${scale})`
  const stopCharging = () => {
    if (chargeFrame !== undefined) {
      view.cancelAnimationFrame(chargeFrame)
      chargeFrame = undefined
    }

    holdStarted = undefined
  }
  const updateCharge = (now: number) => {
    chargeFrame = undefined

    if (holdStarted === undefined) {
      return
    }

    const charge = getEmojiCharge(now - holdStarted)
    glyph.style.transform = chargeTransform(charge.scale)

    if (charge.power < 1) {
      chargeFrame = view.requestAnimationFrame(updateCharge)
    }
  }
  const startCharging = () => {
    stopCharging()
    holdStarted = view.performance.now()
    updateCharge(holdStarted)
  }

  const reset = () => {
    delete glyph.dataset.keyHeld
    pointer = undefined
    pressed = false
    releaseAnimation?.cancel()
    stopCharging()
    drag = getEmojiDrag(0, 0)
    glyph.style.transform = "scale(1)"
    syncAnticipation()
  }
  const press = () => {
    hint?.classList.remove("is-visible")
    view.clearTimeout(hintTimer)
    interacted = true
    pressed = true
    view.clearTimeout(introTimer)
    view.clearTimeout(reminderTimer)
    wiggle?.cancel()
    releaseAnimation?.cancel()
    drag = getEmojiDrag(0, 0)
    startCharging()
    syncAnticipation()
  }
  const burst = (marble: string, power: number) => {
    if (reducedMotion.matches) {
      return
    }

    const rect = emoji.getBoundingClientRect()

    for (let index = 0; index < 12; index += 1) {
      const particle = document.createElement("span")
      const spread = 140 - 116 * power
      const angle = drag.angle + ((Math.random() - 0.5) * spread * Math.PI) / 180
      const speed = (175 + Math.random() * 100) * (0.55 + 1.25 * power) * 1.5
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed
      const duration = 2000 + Math.random() * 600
      const rotation = (Math.random() - 0.5) * 300
      const airResistance = 1.1
      const gravity = 150
      const frames: Keyframe[] = []

      for (let step = 0; step <= 60; step += 1) {
        const progress = step / 60
        const time = (progress * duration) / 1000
        const travel = (1 - Math.exp(-airResistance * time)) / airResistance
        const x = velocityX * travel
        const y = (velocityY - gravity / airResistance) * travel + (gravity / airResistance) * time

        frames.push({
          transform: `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotation * travel}deg) scale(${0.8 - progress * 0.2})`,
          opacity: Math.pow(1 - progress, 1.3),
          offset: progress,
        })
      }

      particle.className = "syr-emoji-confetti"
      particle.textContent = marble
      particle.setAttribute("aria-hidden", "true")
      particle.style.left = `${rect.left + rect.width / 2 + drag.x}px`
      particle.style.top = `${rect.top + rect.height / 2 + drag.y}px`
      particle.style.fontSize = `${Math.min(rect.height * 0.65, 40)}px`
      document.body.append(particle)
      particles.add(particle)

      const flight = particle.animate(frames, { duration, easing: "linear" })

      flight.onfinish = () => {
        particle.remove()
        particles.delete(particle)
      }
    }
  }
  const launch = (next: string, power = 1) => {
    const marble = face.textContent ?? original
    const charge = getEmojiCharge(power * 1000)
    const peak = 1.15 + power * 0.6
    stopCharging()
    glyph.style.transform = "scale(1)"
    face.textContent = next
    releaseAnimation?.cancel()

    if (!reducedMotion.matches) {
      releaseAnimation = glyph.animate(
        [{ transform: chargeTransform(charge.scale) }, { transform: "scale(1)" }],
        {
          duration: 180 + power * 80,
          easing: `linear(0, 0.15, 0.55, 1, ${peak}, ${1 + (peak - 1) * 0.6}, 1, ${1 - power * 0.2}, 1.04, 1)`,
        },
      )
    }

    if (releaseAnimation) {
      releaseAnimation.onfinish = syncAnticipation
    }

    burst(marble, power)
    drag = getEmojiDrag(0, 0)
    syncAnticipation()
  }
  const release = () => {
    hint?.classList.remove("is-visible")
    view.clearTimeout(hintTimer)
    const charge = getEmojiCharge(
      holdStarted === undefined ? 150 : view.performance.now() - holdStarted,
    )
    pointer = undefined
    pressed = false
    interacted = true
    view.clearTimeout(introTimer)
    view.clearTimeout(reminderTimer)
    wiggle?.cancel()
    launch(bag.next().value, charge.power)
  }

  const isVisible = () => {
    const rect = emoji.getBoundingClientRect()

    return !document.hidden && rect.bottom > 0 && rect.top < view.innerHeight
  }
  const remind = () => {
    if (interacted || pressed || hovered || reducedMotion.matches || !isVisible()) {
      return
    }

    wiggle?.cancel()
    wiggle = glyph.animate(
      [
        { transform: "translateY(0) rotate(0deg) scale(1)" },
        { transform: "translateY(-8px) rotate(-18deg) scale(1.18)", offset: 0.2 },
        { transform: "translateY(-6px) rotate(16deg) scale(1.12)", offset: 0.4 },
        { transform: "translateY(-4px) rotate(-12deg) scale(1.08)", offset: 0.6 },
        { transform: "translateY(-2px) rotate(8deg) scale(1.04)", offset: 0.8 },
        { transform: "translateY(0) rotate(0deg) scale(1)" },
      ],
      { duration: 650, easing: "ease-in-out" },
    )
  }
  const queueIntro = () => {
    introTimer = view.setTimeout(() => {
      if (!interacted && isVisible()) {
        launch("✌️", 0.1)
        hintTimer = view.setTimeout(() => {
          if (!interacted) {
            hint?.classList.add("is-visible")
          }
        }, 5000)
      }
    }, 1000)
  }

  if (document.readyState === "complete") {
    queueIntro()
  } else {
    view.addEventListener("load", queueIntro, { once: true })
  }

  const scheduleReminder = () => {
    if (interacted) {
      return
    }

    reminderTimer = view.setTimeout(() => {
      remind()
      reminderCount += 1

      if (reminderCount > 1) {
        reminderDelay = Math.min(reminderDelay * 2, 128_000)
      }

      scheduleReminder()
    }, reminderDelay)
  }

  scheduleReminder()

  emoji.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch") {
      hovered = true
      wiggle?.cancel()
      syncAnticipation()
    }
  })
  emoji.addEventListener("pointerleave", () => {
    hovered = false
    syncAnticipation()
  })

  emoji.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || pointer !== undefined) {
      return
    }

    event.preventDefault()
    glyph.dataset.pointerFocus = "true"
    glyph.focus({ preventScroll: true })
    pointer = event.pointerId
    pointerStart = { x: event.clientX, y: event.clientY }
    emoji.setPointerCapture(pointer)
    press()
  })
  const aim = (event: PointerEvent) => {
    drag = getEmojiDrag(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
    const charge = getEmojiCharge(
      holdStarted === undefined ? 0 : view.performance.now() - holdStarted,
    )
    glyph.style.transform = chargeTransform(charge.scale)
    syncAnticipation()
  }

  view.addEventListener("pointermove", (event) => {
    if (pointer === event.pointerId) {
      aim(event)
    }
  })
  view.addEventListener("pointerup", (event) => {
    if (pointer !== event.pointerId) {
      return
    }

    aim(event)
    release()
  })
  view.addEventListener("pointercancel", (event) => {
    if (pointer === event.pointerId) {
      reset()
    }
  })
  document.addEventListener(
    "keydown",
    () => {
      delete glyph.dataset.pointerFocus
    },
    { capture: true },
  )
  glyph.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      glyph.dataset.keyHeld = "true"

      if (!event.repeat) {
        press()
      }
    }
  })
  glyph.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      delete glyph.dataset.keyHeld

      if (pressed && pointer === undefined) {
        release()
      }
    }
  })
  glyph.addEventListener("click", (event) => {
    if (event.detail === 0) {
      release()
    }
  })
  reducedMotion.addEventListener("change", syncAnticipation)
  glyph.addEventListener("contextmenu", (event) => event.preventDefault())
  glyph.addEventListener("blur", () => {
    if (pointer === undefined) {
      reset()
    }
  })
  view.addEventListener("blur", reset)
  view.addEventListener("pagehide", () => {
    reset()
    wiggle?.cancel()
    view.clearTimeout(introTimer)
    view.clearTimeout(reminderTimer)
    view.removeEventListener("load", queueIntro)
    view.clearTimeout(hintTimer)

    for (const particle of particles) {
      particle.remove()
    }

    particles.clear()
  })
}
