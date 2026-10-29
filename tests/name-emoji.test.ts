import { describe, expect, it } from "vite-plus/test"
import { getEmojiCharge, getEmojiDrag } from "../src/scripts/name-emoji"

describe("emoji slingshot charge", () => {
  it("starts at full size and interpolates over one second", () => {
    expect(getEmojiCharge(0)).toEqual({ power: 0, scale: 1 })
    expect(getEmojiCharge(500)).toEqual({ power: 0.5, scale: 0.7 })
    expect(getEmojiCharge(1000)).toEqual({ power: 1, scale: 0.4 })
  })

  it("caps charge after one second and rejects negative elapsed time", () => {
    expect(getEmojiCharge(5000)).toEqual(getEmojiCharge(1000))
    expect(getEmojiCharge(-100)).toEqual(getEmojiCharge(0))
  })
})

describe("emoji slingshot aim", () => {
  it("follows a drag gently and shoots in the opposite direction", () => {
    const drag = getEmojiDrag(30, -40)

    expect(drag.x).toBe(9)
    expect(drag.y).toBe(-12)
    expect(drag.angle).toBeCloseTo(Math.atan2(40, -30))
  })

  it("limits the follow distance and defaults to upward for taps", () => {
    const drag = getEmojiDrag(300, 400)

    expect(Math.hypot(drag.x, drag.y)).toBeCloseTo(72)
    expect(getEmojiDrag(2, 3).angle).toBe(-Math.PI / 2)
    expect(getEmojiDrag(0, 0)).toEqual({ x: 0, y: 0, angle: -Math.PI / 2 })
  })
})
