export function bindPrintAction(button: EventTarget, printPage: () => void): void {
  button.addEventListener("click", () => printPage())
}
