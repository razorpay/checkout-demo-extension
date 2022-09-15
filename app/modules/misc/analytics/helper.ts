import type { CustomObject } from 'types';

/**
 * transforms experiment values received from preferences, based on the below mapping
 * falsy => 0
 * string => string
 * any truthy except string => 1
 * @param {object} experiments
 * @returns {object}
 */
export function formatPrefExperiments(experiments: CustomObject<unknown>) {
  try {
    return Object.keys(experiments).reduce(
      (acc: CustomObject<unknown>, curr) => {
        const exp = experiments[curr];
        if (exp) {
          if (typeof exp !== 'string') {
            acc[curr] = 1;
          } else {
            acc[curr] = exp;
          }
        } else {
          acc[curr] = 0;
        }
        return acc;
      },
      {}
    );
  } catch (err) {}
}
