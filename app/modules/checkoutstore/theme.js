import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import { COLORS } from 'common/constants';
import { setRootCSSVariable } from 'utils/CSSVar';

const {
  RAZORPAY_COLOR,
  RAZORPAY_HOVER_COLOR,
  TEXT_COLOR_BLACK,
  TEXT_COLOR_WHITE,
} = COLORS;

const theme = {};

export function getThemeMeta() {
  return _Obj.clone(theme);
}

export function getThemeColor() {
  return theme.color;
}

export function getColorVariations(fallback = false) {
  if (fallback && !theme.backgroundColor && !theme.foregroundColor) {
    return Color.getColorVariations(RAZORPAY_COLOR);
  }
  return {
    backgroundColor: theme.backgroundColor,
    foregroundColor: theme.foregroundColor,
  };
}

export function setThemeColor(color) {
  const colorVariations = Color.getColorVariations(color);
  const { backgroundColor, foregroundColor } = Color.getColorVariations(color);

  theme.color = color;
  theme.backgroundColor = backgroundColor;
  theme.foregroundColor = foregroundColor;
  theme.textColor = Color.isDark(color) ? TEXT_COLOR_WHITE : TEXT_COLOR_BLACK;
  theme.hoverStateColor = Color.getHoverStateColor(
    color,
    backgroundColor,
    RAZORPAY_HOVER_COLOR
  );
  theme.activeStateColor = Color.getActiveStateColor(
    color,
    backgroundColor,
    RAZORPAY_HOVER_COLOR
  );
  theme.highlightColor = Color.getHighlightColor(color, RAZORPAY_COLOR);
  theme.secondaryHighlightColor = theme.hoverStateColor;
  theme.icons = _PaymentMethodIcons.getIcons(colorVariations);
  theme.highlightBorderColor = Color.transparentify(theme.color, 40);
  theme.headerLogoBgColor = Color.transparentify(theme.color, 50);
  theme.headerLogoTextColor = Color.isDark(theme.headerLogoBgColor)
    ? TEXT_COLOR_WHITE
    : TEXT_COLOR_BLACK;

  setRootCSSVariable({
    'primary-color': color,
    'text-color': theme.textColor,
    'highlight-color': theme.highlightColor,
    'hover-state-color': theme.hoverStateColor,
    'background-color': theme.backgroundColor,
    'secondary-highlight-color': theme.secondaryHighlightColor,
    'active-state-color': theme.activeStateColor,
    'header-logo-bg-color': theme.headerLogoBgColor,
    'header-logo-text-color': theme.headerLogoTextColor,
  });
}
