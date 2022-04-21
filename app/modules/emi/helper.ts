import { Events } from 'analytics';
import { pushOverlay } from 'navstack';
import { EMI_PLAN_VIEW_ALL } from './events';
import { EMIPlanView } from './ui/EMIPlanView';

export function viewAllEMIPlans(tab = '') {
  pushOverlay({
    component: EMIPlanView,
    props: {},
  });
  (Events as any).TrackBehav(EMI_PLAN_VIEW_ALL, {
    from: tab,
  });
}
