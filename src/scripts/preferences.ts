export const identities = ["nasa", "editorial", "neobrutalism"] as const;
export const appearances = ["light", "dark", "system"] as const;
export type Identity = (typeof identities)[number];
export type Appearance = (typeof appearances)[number];

export const validIdentity = (value: string | null): Identity =>
  identities.find((item) => item === value) ?? "nasa";
export const validAppearance = (value: string | null): Appearance =>
  appearances.find((item) => item === value) ?? "light";
