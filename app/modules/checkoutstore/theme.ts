import * as Color from 'lib/color';
import * as _PaymentMethodIcons from 'ui/icons/payment-methods';
import { COLORS, constantCSSVars } from 'common/constants';
import { setRootCSSVariable } from 'utils/CSSVar';
import { isOneClickCheckout, shouldOverrideBrandColor } from 'razorpay';
import { get, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

const {
  RAZORPAY_COLOR,
  RAZORPAY_HOVER_COLOR,
  TEXT_COLOR_BLACK,
  TEXT_COLOR_WHITE,
  MAGIC_BRAND_COLOR,
} = COLORS;

type Theme = {
  color: string;
  backgroundColor: string;
  foregroundColor: string;
  textColor: string;
  hoverStateColor: string;
  activeStateColor: string;
  highlightColor: string;
  secondaryHighlightColor: string;
  icons: ReturnType<typeof _PaymentMethodIcons.getIcons>;
  highlightBorderColor: string;
  headerLogoBgColor: string;
  headerLogoTextColor: string;
  lightHighlightColor: string;
  isDarkColor: boolean;
};

const theme: Theme = {} as Theme;

export const themeStore: Writable<Theme> = writable(theme);

export function getThemeMeta() {
  return get(themeStore);
}

export function getThemeColor() {
  return theme.color;
}

export function getColorVariations(fallback = false) {
  if (fallback && !theme.backgroundColor && !theme.foregroundColor) {
    return Color.getColorVariations(
      isOneClickCheckout() ? MAGIC_BRAND_COLOR : RAZORPAY_COLOR
    );
  }
  return {
    backgroundColor: theme.backgroundColor,
    foregroundColor: theme.foregroundColor,
  };
}

function getMagicIconColorVariations() {
  if (!isOneClickCheckout() || shouldOverrideBrandColor()) {
    return {};
  }

  return {
    backgroundColor: MAGIC_BRAND_COLOR,
    foregroundColor: '#072654',
  };
}

export function setThemeColor(color: string) {
  const colorVariations = Color.getColorVariations(color) as {
    foregroundColor: string;
    backgroundColor: string;
  };
  const { backgroundColor, foregroundColor } = colorVariations;

  theme.color = color;
  theme.backgroundColor = backgroundColor;
  theme.foregroundColor = foregroundColor;
  const isDarkColor = Color.isDark(color);
  theme.isDarkColor = isDarkColor;
  theme.textColor = isDarkColor ? TEXT_COLOR_WHITE : TEXT_COLOR_BLACK;
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
  theme.lightHighlightColor = isDarkColor
    ? 'rgba(255,255,255, 0.1)'
    : 'rgba(107, 107, 107, 0.15)';
  theme.secondaryHighlightColor = theme.hoverStateColor;
  theme.icons = _PaymentMethodIcons.getIcons({
    ...colorVariations,
    ...getMagicIconColorVariations(),
  });
  theme.highlightBorderColor = Color.transparentify(theme.color, 40);
  theme.headerLogoBgColor = Color.transparentify(theme.color, 50);
  theme.headerLogoTextColor = Color.isDark(theme.headerLogoBgColor)
    ? TEXT_COLOR_WHITE
    : TEXT_COLOR_BLACK;

  themeStore.set(theme);

  setRootCSSVariable({
    'primary-color': color,
    'text-color': theme.textColor,
    'highlight-color': theme.highlightColor,
    'light-highlight-color': theme.lightHighlightColor,
    'hover-state-color': theme.hoverStateColor,
    'background-color': theme.backgroundColor,
    'secondary-highlight-color': theme.secondaryHighlightColor,
    'active-state-color': theme.activeStateColor,
    'header-logo-bg-color': theme.headerLogoBgColor,
    'header-logo-text-color': theme.headerLogoTextColor,
    ...constantCSSVars,
  });
}

export function getIcons() {
  const themeMeta = getThemeMeta();
  return themeMeta.icons;
}
