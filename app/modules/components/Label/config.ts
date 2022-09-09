import NoCostLabel from 'components/NoCostLabel.svelte';
import StartingFromLabel from 'components/StartingFromLabel.svelte';
import { NO_COST_EMI } from 'ui/labels/offers';

export const labelConfig = {
  noCostLabel: {
    component: NoCostLabel,
    props: {
      text: NO_COST_EMI,
      expanded: false,
    },
  },
  startingFromLabel: {
    component: StartingFromLabel,
    props: {
      startingAt: 10,
      expanded: false,
    },
  },
};
