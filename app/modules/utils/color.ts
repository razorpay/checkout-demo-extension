export function isValidHexColorCode(color: string) {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/i.test(color);
}
