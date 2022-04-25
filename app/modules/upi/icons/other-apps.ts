import { getColorVariations } from 'checkoutstore/theme';

export default (
  withBorder: boolean = false,
  colors: {
    foregroundColor: string;
    backgroundColor: string;
  } = getColorVariations(true)
) => {
  if (withBorder) {
    return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="16" height="16" rx="2" fill="white"/>
      <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="${colors.foregroundColor}" stroke-opacity="0.999377"/>
      <circle r="1" transform="matrix(-1 0 0 1 4 8)" fill="${colors.backgroundColor}"/>
      <circle r="1" transform="matrix(-1 0 0 1 8 8)" fill="${colors.backgroundColor}"/>
      <circle r="1" transform="matrix(-1 0 0 1 12 8)" fill="${colors.backgroundColor}"/>
      </svg>`;
  }

  return `<svg width="30" height="6" viewBox="0 0 30 6" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle r="3" transform="matrix(-1 0 0 1 3 3)" fill="${colors.backgroundColor}"/>
<circle r="3" transform="matrix(-1 0 0 1 15 3)" fill="${colors.backgroundColor}"/>
<circle r="3" transform="matrix(-1 0 0 1 27 3)" fill="${colors.backgroundColor}"/>
</svg>`;
};
