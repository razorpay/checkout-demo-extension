import type { handlerType } from '../../core/types';
import { getIin, getFlows } from '../../../mock-api/mocks/flows';

export const cardIINHandler: handlerType = () => {
  return {
    response: `Razorpay.jsonp0_1(${JSON.stringify(getIin())})`,
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
    response: `Razorpay.jsonp1_1(${JSON.stringify(getFlows(queryParams))})`,
    status_code: 200,
  };
};
