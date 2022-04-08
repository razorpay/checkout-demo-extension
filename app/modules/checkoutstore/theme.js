import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import { COLORS } from 'common/constants';
import CSSVariable from 'utils/CSSVar';

const { RAZORPAY_COLOR, RAZORPAY_HOVER_COLOR, TEXT_COLOR_BLACK, TEXT_COLOR_WHITE } = COLORS;

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
  theme.hoverStateColor = Color.getHoverStateColor(color, backgroundColor, RAZORPAY_HOVER_COLOR);
  theme.activeStateColor = Color.getActiveStateColor(color, backgroundColor, RAZORPAY_HOVER_COLOR);
  theme.highlightColor = Color.getHighlightColor(color, RAZORPAY_COLOR);
  theme.secondaryHighlightColor = theme.hoverStateColor;
  theme.icons = _PaymentMethodIcons.getIcons(colorVariations);

  CSSVariable.set('primary-color', color);
  CSSVariable.set('text-color', theme.textColor);
  CSSVariable.set('highlight-color', theme.highlightColor);
  CSSVariable.set('hover-state-color', theme.hoverStateColor);
  CSSVariable.set('background-color', theme.backgroundColor);
  CSSVariable.set('secondary-highlight-color', theme.secondaryHighlightColor);
  CSSVariable.set('active-state-color', theme.activeStateColor);
}
