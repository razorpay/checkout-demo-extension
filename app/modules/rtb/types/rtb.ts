export enum ExperimentVariants {
  NotApplicable = 'not_applicable',
  Show = 'rtb_show',
  NoShow = 'rtb_no_show',
}

export type RTBExperiment = {
  experiment: boolean;
  variant: ExperimentVariants;
};
