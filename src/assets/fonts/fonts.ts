/**
 * Inter font family mapping for the HabitTracker app.
 *
 * On React Native, custom fonts require a separate fontFamily per weight.
 * Instead of using `fontWeight`, set `fontFamily` to the appropriate Inter variant.
 *
 * Usage:
 *   import { fonts } from '../assets/fonts/fonts';
 *   { fontFamily: fonts.bold }       // 700
 *   { fontFamily: fonts.semiBold }   // 600
 */

export const fonts = {
  /** Inter 400 – body text, secondary labels */
  regular: 'Inter_400Regular',
  /** Inter 500 – medium emphasis, sub-labels */
  medium: 'Inter_500Medium',
  /** Inter 600 – semi-bold, section titles, buttons */
  semiBold: 'Inter_600SemiBold',
  /** Inter 700 – bold, card titles, emphasis */
  bold: 'Inter_700Bold',
  /** Inter 800 – extra bold, page headings */
  extraBold: 'Inter_800ExtraBold',
} as const;

export type FontWeight = keyof typeof fonts;
