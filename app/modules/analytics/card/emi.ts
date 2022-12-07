import { getEventsName } from '../helpers';

// Events for emi Plans
const emiPlans = {
  /** view emi plans click from card screen */
  VIEW_EMI_PLANS: 'plans:view',
  /** change selected emi plan from emi screen */
  EDIT_EMI_PLANS: 'plans:edit',
  /** Pay without EMI */
  PAY_WITHOUT_EMI: 'pay_without',
  /** View All Emi Plans */
  VIEW_ALL_EMI_PLANS: 'plans:view:all',
  /** Select EMI plan */
  SELECT_EMI_PLAN: 'plan:select',
  /** Choose emi plan */
  CHOOSE_EMI_PLAN: 'plan:choose',
  /** EMI PLANS render */
  EMI_PLANS: 'plans',
  /** EMI ask Contact screen render */
  EMI_CONTACT: 'contact',
  /** EMI Contact filled */
  EMI_CONTACT_FILLED: 'contact:filled',
} as const;

export default getEventsName('emi', emiPlans);
