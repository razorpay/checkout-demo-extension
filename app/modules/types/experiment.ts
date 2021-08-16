export interface Experiment {
  name: string;
  evaluator: () => number;
}
