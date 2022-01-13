import { sanitizeHTML } from 'utils/security';

describe('HTML Sanitizer', () => {
  test('sanitizes HTML string', () => {
    expect(sanitizeHTML('"><img src=x onerror=alert()>')).toBe(
      '&#34;&#62;&#60;img src&#61;x onerror&#61;alert&#40;&#41;&#62;'
    );
  });

  test('does not sanitize non string value', () => {
    expect(sanitizeHTML(null)).toBe(null);

    expect(sanitizeHTML(false)).toBe(false);
  });
});
