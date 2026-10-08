// Jisr design tokens for React Native — generated from docs/design-system/tokens.css.
// Day and Night are both first-class: pick with useColorScheme().
// Rules (from the design system README):
//   green = primary action (max one green button per screen) · wood = the recipient / warmth
//   navy = header & hero fills · lavender = ONLY Jisr's own AI voice · urgent = safety ONLY

export const colors = {
  light: {
    surface: '#faf6ef', surfaceRaised: '#fffdf9', surfaceSunken: '#f1eadf',
    line: '#e2d8c8', lineStrong: '#8f7e66',
    ink: '#1d2a44', inkMuted: '#5a6377',
    green: '#2f6b4f', greenSoft: '#e2eee5', onGreen: '#ffffff',
    wood: '#8a5a36', woodSoft: '#f3e7d7',
    navy: '#24365c', onNavy: '#f6f1e8',
    lavender: '#6a58a6', lavenderSoft: '#ece8f6',
    urgent: '#b0432a', urgentSoft: '#f9e4dc', onUrgent: '#ffffff',
  },
  dark: {
    surface: '#131b2b', surfaceRaised: '#1b2538', surfaceSunken: '#0e1522',
    line: '#2c3850', lineStrong: '#6f7d99',
    ink: '#f2eee6', inkMuted: '#a9b1c2',
    green: '#8cc3a4', greenSoft: '#1c3328', onGreen: '#0f2419',
    wood: '#d4a77e', woodSoft: '#33271b',
    navy: '#2b3f68', onNavy: '#f6f1e8',
    lavender: '#b9abe8', lavenderSoft: '#2a2442',
    urgent: '#f2917a', urgentSoft: '#3b1f19', onUrgent: '#2a120b',
  },
} as const;

export type ThemeColors = typeof colors.light;

export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 24, full: 9999 } as const;

// Fonts: npx expo install expo-font @expo-google-fonts/readex-pro @expo-google-fonts/ibm-plex-sans-arabic
// then load them with useFonts() in App.tsx. Check the exact export names after installing.
export const fonts = {
  display: 'ReadexPro_600SemiBold',
  displayMedium: 'ReadexPro_500Medium',
  body: 'IBMPlexSansArabic_400Regular',
  bodyMedium: 'IBMPlexSansArabic_500Medium',
} as const;

// Arabic needs room: never below 15px reading text or 1.6 line height.
export const type = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 48 },
  title:   { fontFamily: fonts.displayMedium, fontSize: 24, lineHeight: 36 },
  heading: { fontFamily: fonts.displayMedium, fontSize: 19, lineHeight: 30 },
  body:    { fontFamily: fonts.body, fontSize: 17, lineHeight: 28 },   // message drafts
  bodySm:  { fontFamily: fonts.body, fontSize: 15, lineHeight: 24 },
  label:   { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 20 }, // never for safety text
} as const;

export const shadow = {
  sm: { shadowColor: '#1d2a44', shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  lg: { shadowColor: '#1d2a44', shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
} as const;

export const motion = { fast: 200, normal: 300 } as const; // ease-out fades, no bounce; respect reduced motion
