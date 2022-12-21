import { getPreferences } from '../../../mock-api/mocks/preferences';
import type { handlerType } from '../../core/types';

const PreferenceHandler: handlerType = function ({ name }) {
  let response = getPreferences(name);
  if (!response) {
    console.info(`No preference response found for context:${name}`);
    return {
      response: {},
    };
  }
  return {
    response,
  };
};

export default PreferenceHandler;
