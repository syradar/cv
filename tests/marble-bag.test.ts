import { describe, expect, it } from "vite-plus/test"
import { createMarbleBag } from "../src/scripts/marble-bag"

describe("marble bag", () => {
  it("draws every marble before refilling and remains iterable", () => {
    const marbles = ["a", "b", "c"]
    const bag = createMarbleBag(marbles, { random: () => 0.75 })
    const first = [bag.next().value, bag.next().value, bag.next().value]
    const second = [bag.next().value, bag.next().value, bag.next().value]

    expect(new Set(first)).toEqual(new Set(marbles))
    expect(new Set(second)).toEqual(new Set(marbles))
    expect(second[0]).not.toBe(first[2])
    expect(bag[Symbol.iterator]()).toBe(bag)
    expect(marbles).toEqual(["a", "b", "c"])
  })

  it("treats the current marble as already drawn in the first bag", () => {
    const bag = createMarbleBag(["a", "b", "c"], { previous: "a", random: () => 0 })

    expect(bag.next().value).toBe("b")
    expect(bag.next().value).toBe("c")
    expect(bag.next().value).toBe("a")
  })

  it("avoids consecutive repeats across refills", () => {
    const bag = createMarbleBag(["a", "b"], { random: () => 0.99 })
    let previous: string | undefined

    for (let index = 0; index < 20; index += 1) {
      const marble = bag.next().value

      expect(marble).not.toBe(previous)
      previous = marble
    }
  })

  it("supports undefined and NaN as marbles", () => {
    const bag = createMarbleBag([undefined, NaN, 1], { previous: undefined, random: () => 0 })

    expect(bag.next().value).toBeNaN()
    expect(bag.next().value).toBe(1)
    expect(bag.next().value).toBeUndefined()
  })

  it("deduplicates marbles and rejects bags that cannot avoid repeats", () => {
    const bag = createMarbleBag(["a", "a", "b"], { random: () => 0 })

    expect([bag.next().value, bag.next().value]).toEqual(["a", "b"])
    expect(() => createMarbleBag([])).toThrow(RangeError)
    expect(() => createMarbleBag(["a", "a"])).toThrow(RangeError)
  })
})
