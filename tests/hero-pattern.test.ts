import { describe, expect, it } from "vite-plus/test"
import { patternDirection } from "../src/scripts/hero-pattern"

describe("pattern steering", () => {
  it("moves northwest for a pointer northwest of center", () => {
    const direction = patternDirection(-1, -1)

    expect(direction.x).toBeLessThan(0)
    expect(direction.y).toBeLessThan(0)
    expect(Math.hypot(direction.x, direction.y)).toBeCloseTo(1)
  })

  it("stops at the center without producing an invalid direction", () => {
    expect(patternDirection(0, 0)).toEqual({ x: 0, y: 0 })
  })

  it("slows near the center and caps speed for extreme tilt", () => {
    expect(patternDirection(0.2, 0)).toEqual({ x: 0.2, y: 0 })
    expect(patternDirection(20, 0)).toEqual({ x: 1, y: 0 })
  })
})
