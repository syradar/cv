/** Keep each word anchored while its variable-font glyphs redistribute space. */
export function initializeNameWidth(hero: HTMLElement): void {
  const lines = hero.querySelectorAll<HTMLElement>("[data-name-line]")

  for (const line of lines) {
    const reference = line.querySelector<HTMLElement>("[data-name-reference]")
    const content = line.querySelector<HTMLElement>("[data-name-content]")

    if (!reference || !content) {
      continue
    }

    let targetWidth = 0
    let animatedWidth = 0

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === reference) {
          targetWidth = entry.contentRect.width
        }
        if (entry.target === content) {
          animatedWidth = entry.contentRect.width
        }
      }

      if (targetWidth > 0 && animatedWidth > 0) {
        content.style.transform = `scaleX(${targetWidth / animatedWidth})`
      }
    })

    observer.observe(reference)
    observer.observe(content)
  }
}
