import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import { COLORS } from 'common/constants';

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

export function getColorVariations() {
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
  theme.highlightBorderColor = Color.transparentify(theme.highlightColor, 40);
}
