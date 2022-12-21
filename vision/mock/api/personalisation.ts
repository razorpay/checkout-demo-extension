import { getP13n } from '../../../mock-api/mocks/personalisation';
import type { handlerType } from '../../core/types';

const P13nHandler: handlerType = function ({ name }) {
  let response = getP13n(name);
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

export default P13nHandler;
