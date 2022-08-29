import { COLORS } from 'common/constants';
import { getTheme } from 'one_click_checkout/sessionInterface';
import { shouldOverrideBrandColor } from 'razorpay';

/**
 * Payment method icons have different color scheme than normal
 * when brand color is being used. Since, the same {foregroundColor}
 * and {backgroundColor} are being used at a lot of places throughout
 * we should not override them and have a hook like this function instead.
 *
 * @returns {Object} contaning bgColor and fgColor based on theme/brand
 */
export function getIconColorVariations() {
  const { backgroundColor, foregroundColor } = getTheme();

  if (shouldOverrideBrandColor()) {
    return {
      backgroundColor,
      foregroundColor,
    };
  }

  return {
    backgroundColor: COLORS.MAGIC_BRAND_COLOR,
    foregroundColor: '#072654',
  };
}
