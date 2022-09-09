import { getOption, getPreferences } from './base';

// Experiment function for conditionally showing New EMI flow
export const isEmiV2 = () => {
  const disableRedesignFromOption = getOption('disable_emi_ux');
  let allow = getPreferences('experiments.emi_ux_revamp');
  if (typeof disableRedesignFromOption === 'boolean') {
    allow = !disableRedesignFromOption;
  }
  return allow;
};
