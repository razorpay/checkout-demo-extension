/**
 * Sanitize and encode all HTML in a user-submitted string
 * Matches character that is not in [a-zA-Z0-9_-]
 * https://portswigger.net/web-security/cross-site-scripting/preventing
 * https://www.w3.org/MarkUp/html-spec/html-spec_13.html
 * @param  {String} str  The user-submitted string
 * @return {String} str  The sanitized string
 */
export function sanitizeHTML(str) {
  if (typeof str !== 'string') return str;

  return str.replace(/[^-\w. ]/gi, function (c) {
    return '&#' + c.charCodeAt(0) + ';';
  });
}
