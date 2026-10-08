// JisrIcon — the Jisr line icon set (24px grid, 1.75px stroke, currentColor).
// Requires: npx expo install react-native-svg
// Usage: <JisrIcon name="talk" size={24} color={theme.urgent} />
// Colour rules: "suggestion" only in lavender (Jisr's AI voice); "alert" only in urgent (safety).
import React from 'react';
import { I18nManager } from 'react-native';
import { SvgXml } from 'react-native-svg';

const PATHS = {
  "exams": "<path d=\"M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z\"/><path d=\"M12 6.5v13\"/>",
  "family": "<path d=\"M4 11 12 4.5 20 11v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z\"/><path d=\"M10 20v-3.5a2 2 0 0 1 4 0V20\"/>",
  "work": "<rect x=\"3.5\" y=\"7.5\" width=\"17\" height=\"12\" rx=\"2.5\"/><path d=\"M9 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 6v1.5\"/><path d=\"M3.5 12.5h17\"/>",
  "relationships": "<circle cx=\"9\" cy=\"8.5\" r=\"3\"/><path d=\"M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5\"/><circle cx=\"16.5\" cy=\"9.5\" r=\"2.5\"/><path d=\"M16 14.1c2.6-.3 4.5 1.5 4.5 4.4\"/>",
  "sleep": "<path d=\"M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10Z\"/>",
  "money": "<rect x=\"3.5\" y=\"6.5\" width=\"17\" height=\"13\" rx=\"2.5\"/><path d=\"M20.5 11h-4a2 2 0 0 0 0 4h4\"/><path d=\"M6 6.5 14.5 4a1 1 0 0 1 1.3 1v1.5\"/>",
  "other": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M8.5 12h.01M12 12h.01M15.5 12h.01\" stroke-width=\"2.5\"/>",
  "person": "<circle cx=\"12\" cy=\"8\" r=\"3.5\"/><path d=\"M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6\"/>",
  "edit": "<path d=\"M14.5 5.5 18.5 9.5 8.5 19.5h-4v-4Z\"/><path d=\"M12.5 7.5 16.5 11.5\"/>",
  "share": "<path d=\"M12 14.5V4\"/><path d=\"M8 7.5 12 3.5 16 7.5\"/><path d=\"M7.5 10.5H6A1.5 1.5 0 0 0 4.5 12v6.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V12a1.5 1.5 0 0 0-1.5-1.5h-1.5\"/>",
  "copy": "<rect x=\"8.5\" y=\"8.5\" width=\"11\" height=\"11\" rx=\"2.5\"/><path d=\"M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5\"/>",
  "send": "<path d=\"M20.5 3.5 10.5 13.5\"/><path d=\"M20.5 3.5 14 20.5l-3.5-7-7-3.5Z\"/>",
  "back": "<path d=\"M14.5 5.5 8 12l6.5 6.5\"/>",
  "close": "<path d=\"M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5\"/>",
  "check": "<path d=\"M5 12.5 9.5 17 19 7.5\"/>",
  "preview": "<path d=\"M2.5 12C5 7 8.5 5 12 5s7 2 9.5 7c-2.5 5-6 7-9.5 7s-7-2-9.5-7Z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  "delete": "<path d=\"M4.5 7h15\"/><path d=\"M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2\"/><path d=\"M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12\"/>",
  "talk": "<path d=\"M5 4.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4.5 3.5v-3.5H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z\"/><path d=\"M12 14c-2.4-1.5-3.3-2.8-2.8-4.1.5-1 2-1.3 2.8 0 .8-1.3 2.3-1 2.8 0 .5 1.3-.4 2.6-2.8 4.1Z\"/>",
  "phone": "<path d=\"M6.5 3.5h3l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4.5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z\"/>",
  "alert": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5v5.5\"/><path d=\"M12 16.25h.01\" stroke-width=\"2.5\"/>",
  "privacy": "<path d=\"M12 3.5 19 6.3v5.4c0 4.4-3 7.6-7 8.8-4-1.2-7-4.4-7-8.8V6.3Z\"/><path d=\"M9 12l2.2 2.2L15.5 10\"/>",
  "on-device": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2.5\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\"/><path d=\"M12 14.5v2\"/>",
  "suggestion": "<path d=\"M11 4c.6 4.5 1.5 5.4 6 6-4.5.6-5.4 1.5-6 6-.6-4.5-1.5-5.4-6-6 4.5-.6 5.4-1.5 6-6Z\"/><path d=\"M18.5 15v4M16.5 17h4\"/>",
  "bridge": "<path d=\"M2.5 9.5h19\"/><path d=\"M4 9.5V19M20 9.5V19\"/><path d=\"M4 19v-2.5a4 4 0 0 1 8 0V19M12 19v-2.5a4 4 0 0 1 8 0V19\"/><path d=\"M8 9.5V7M12 9.5V7M16 9.5V7\"/>"
} as const;

export type JisrIconName = keyof typeof PATHS;

// Icons that point somewhere are mirrored in right-to-left layouts.
const MIRROR_IN_RTL: JisrIconName[] = ["back", "send"];

export function JisrIcon({ name, size = 24, color = '#1d2a44' }: { name: JisrIconName; size?: number; color?: string }) {
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${PATHS[name]}</svg>`;
  const mirror = I18nManager.isRTL && MIRROR_IN_RTL.includes(name);
  return <SvgXml xml={xml} width={size} height={size} color={color} style={mirror ? { transform: [{ scaleX: -1 }] } : undefined} />;
}

export default JisrIcon;
