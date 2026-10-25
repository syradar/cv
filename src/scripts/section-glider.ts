interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getGliderPosition(nav: Rect, link: Rect) {
  return {
    width: `${link.width}px`,
    height: `${link.height}px`,
    transform: `translate(${link.left - nav.left}px, ${link.top - nav.top}px)`,
  };
}

export function initializeGlider(glider: HTMLElement): void {
  const nav = glider.closest<HTMLElement>('[data-component="section-nav"]');
  if (!(nav instanceof HTMLElement)) {
    throw new Error("A section glider must be inside its section navigation.");
  }

  const moveGlider = (link: HTMLElement) => {
    const position = getGliderPosition(nav.getBoundingClientRect(), link.getBoundingClientRect());
    Object.assign(glider.style, position);
    glider.dataset.visible = "true";
  };

  const links = nav.querySelectorAll<HTMLElement>("[data-section-link]");
  for (const link of links) {
    link.addEventListener("pointerenter", () => moveGlider(link));
    link.addEventListener("focus", () => moveGlider(link));
  }
  nav.addEventListener("pointerleave", () => {
    glider.dataset.visible = "false";
  });
  nav.addEventListener("focusout", () => {
    glider.dataset.visible = "false";
  });
}
