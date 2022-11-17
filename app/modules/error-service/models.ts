/**
 * @readonly
 * @enum
 */
export const SEVERITY_LEVELS = {
  /**
   * Severity: Level 0 - Fatal
   * Usage: Use this when the UI is in an unrecoverable state and has to be refreshed/retried to fix
   */
  S0: 'S0',

  /**
   * Severity: Level 1 - Critical
   * Usage: Use this for errors which block the user from continuing down a particular UI flow
   */
  S1: 'S1',

  /**
   * Severity: Level 2 - Warn
   * Usage: Use this for less severe error where it does not hamper the user from making the payment but degrades user experience
   * E.g. Vernacular flows, Personalization etc
   */
  S2: 'S2', // Warn

  /**
   * Severity Level 3 - Trivial
   * Usage: Use this for errors whose effects are  minor / close to negligent
   * E.g. Vernacular flows, Unable to run AB experiments etc
   */
  S3: 'S3', // Trivial
};
