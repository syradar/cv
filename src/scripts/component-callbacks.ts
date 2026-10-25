import type { Appearance, Identity } from "./preferences";

export interface ComponentCallbacks {
  setIdentity: (identity: Identity) => void;
  setTheme: (appearance: Appearance) => void;
  printPage: () => void;
}

export const noComponentCallbacks: ComponentCallbacks = {
  setIdentity: () => undefined,
  setTheme: () => undefined,
  printPage: () => undefined,
};
