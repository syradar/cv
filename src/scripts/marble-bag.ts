interface MarbleBagOptions<T> {
  previous?: T
  random?: () => number
}

/** Draw every distinct marble before refilling, without consecutive repeats. */
export function createMarbleBag<T>(
  marbles: readonly T[],
  options: MarbleBagOptions<T> = {},
): Generator<T, never, unknown> {
  const contents = [...new Set(marbles)]
  const random = options.random ?? Math.random

  if (contents.length < 2) {
    throw new RangeError("A marble bag requires at least two distinct marbles.")
  }

  let hasPrevious = "previous" in options
  let previous = options.previous
  const isPrevious = (marble: T) =>
    hasPrevious && (marble === previous || Object.is(marble, previous))
  let remaining = contents.filter((marble) => !isPrevious(marble))

  function* draw(): Generator<T, never, unknown> {
    while (true) {
      if (remaining.length === 0) {
        remaining = [...contents]
      }

      const choices = remaining.filter((marble) => !isPrevious(marble))
      const marble = choices[Math.floor(random() * choices.length)]
      const index = remaining.findIndex(
        (candidate) => candidate === marble || Object.is(candidate, marble),
      )
      remaining.splice(index, 1)
      previous = marble
      hasPrevious = true
      yield marble
    }
  }

  return draw()
}
