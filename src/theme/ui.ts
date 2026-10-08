/**
 * Shared UI pieces built from the Jisr design system (docs/design-system/).
 * Colours, spacing, radii and type all come from ./tokens.
 */
import { I18nManager, StyleSheet } from 'react-native';
import { colors, radius, space, type } from './tokens';

/** Day theme. The app is locked to light mode (app.json userInterfaceStyle). */
export const c = colors.light;

/** Modal backdrop: ink (#1d2a44) at 35%. The design system has no backdrop token. */
export const backdrop = 'rgba(29, 42, 68, 0.35)';

/** Lays rows out right-to-left whether or not the OS runs in RTL mode. */
export const rowRtl = I18nManager.isRTL ? 'row' : 'row-reverse';

/**
 * Buttons (docs/design-system/components/Button.md): one green primary per
 * screen for the step the screen is for; everything else plain or quiet.
 * Urgent is for safety actions only. radius.md, minimum height 48.
 */
export const button = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: space[6],
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: rowRtl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
  },
  primary: { backgroundColor: c.green, borderColor: c.green },
  plain: { backgroundColor: c.surfaceRaised, borderColor: c.lineStrong },
  quiet: { backgroundColor: 'transparent', borderColor: 'transparent' },
  urgent: { backgroundColor: c.urgent, borderColor: c.urgent },
  disabled: { opacity: 0.4 },
  label: { ...type.label, textAlign: 'center' },
  labelPrimary: { color: c.onGreen },
  labelPlain: { color: c.ink },
  labelQuiet: { color: c.green },
  labelUrgent: { color: c.onUrgent },
});
