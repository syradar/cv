import { describe, expect, it, vi } from "vite-plus/test";
import { applyPreferenceChoice } from "../src/scripts/appearance-menu";
import { noComponentCallbacks } from "../src/scripts/component-callbacks";
import {
  callbacksForComponent,
  resolveComponentInitializer,
} from "../src/scripts/component-runner";
import { bindPrintAction } from "../src/scripts/print-action";
import { getGliderPosition } from "../src/scripts/section-glider";

describe("component runner", () => {
  it("resolves registered interactive components", () => {
    const names = ["actions", "appearance-menu", "glider", "hero"];
    for (const name of names) {
      expect(resolveComponentInitializer(name, false)).toBeTypeOf("function");
    }
  });

  it("allows unregistered static components but rejects unregistered interactive ones", () => {
    expect(resolveComponentInitializer("surface", true)).toBeUndefined();
    expect(() => resolveComponentInitializer("misspelled", false)).toThrow(
      'No initializer registered for interactive component "misspelled".',
    );
  });

  it("suppresses application callbacks for static components", () => {
    const setIdentity = vi.fn();
    const callbacks = { ...noComponentCallbacks, setIdentity };

    callbacksForComponent(true, callbacks).setIdentity("editorial");

    expect(setIdentity).not.toHaveBeenCalled();
    expect(callbacksForComponent(false, callbacks)).toBe(callbacks);
  });
});

describe("appearance menu callbacks", () => {
  it("routes valid choices to the matching callback", () => {
    const setIdentity = vi.fn();
    const setTheme = vi.fn();

    applyPreferenceChoice("identity", "editorial", {
      ...noComponentCallbacks,
      setIdentity,
      setTheme,
    });
    applyPreferenceChoice("theme", "dark", {
      ...noComponentCallbacks,
      setIdentity,
      setTheme,
    });

    expect(setIdentity).toHaveBeenCalledExactlyOnceWith("editorial");
    expect(setTheme).toHaveBeenCalledExactlyOnceWith("dark");
  });

  it("falls back to valid defaults for malformed values", () => {
    const setIdentity = vi.fn();
    const setTheme = vi.fn();

    applyPreferenceChoice("identity", "unknown", {
      ...noComponentCallbacks,
      setIdentity,
      setTheme,
    });
    applyPreferenceChoice("theme", "unknown", { ...noComponentCallbacks, setIdentity, setTheme });

    expect(setIdentity).toHaveBeenCalledExactlyOnceWith("nasa");
    expect(setTheme).toHaveBeenCalledExactlyOnceWith("light");
  });
});

describe("section glider", () => {
  it("positions itself relative to the navigation container", () => {
    expect(
      getGliderPosition(
        { left: 10, top: 20, width: 300, height: 40 },
        { left: 45, top: 26, width: 80, height: 28 },
      ),
    ).toEqual({
      width: "80px",
      height: "28px",
      transform: "translate(35px, 6px)",
    });
  });
});

describe("print action", () => {
  it("invokes the injected print callback on click", () => {
    const target = new EventTarget();
    const printPage = vi.fn();

    bindPrintAction(target, printPage);
    target.dispatchEvent(new Event("click"));

    expect(printPage).toHaveBeenCalledExactlyOnceWith();
  });
});
