import { dark } from "@clerk/themes";

export const clerkAppearanceLight = {
  variables: {
    colorPrimary: "#FF6B4A",
    colorBackground: "#FFFFFF",
    colorText: "#2B2118",
    colorTextSecondary: "#6B5D4F",
    colorInputBackground: "#FFFBF2",
    colorInputText: "#2B2118",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-jakarta), sans-serif",
  },
  options: {
    socialButtonsVariant: "blockButton" as const,
  },
};

export const clerkAppearanceDark = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#FF6B4A",
    colorBackground: "#171717",
    colorText: "#F5F5F5",
    colorTextSecondary: "#D4D4D4",
    colorInputBackground: "#262626",
    colorInputText: "#F5F5F5",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-jakarta), sans-serif",
  },
  options: {
    socialButtonsVariant: "blockButton" as const,
  },
};

export function getClerkAppearance(isDark: boolean) {
  return isDark ? clerkAppearanceDark : clerkAppearanceLight;
}

export const clerkAppearance = clerkAppearanceLight;