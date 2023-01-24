import type { handlerType } from '../../core/types';
import { getIin, getFlows } from '../../../mock-api/mocks/flows';

export const cardIINHandler: handlerType = () => {
  return {
    response: getIin(),
    status_code: 200,
  };
};

export const paymentFlowsHandler: handlerType = ({ request }) => {
  const url = new URL(request.url());
  const queryParams: { [key in string]: string } = {};

  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return {
    response: getFlows(queryParams),
    status_code: 200,
  };
};
