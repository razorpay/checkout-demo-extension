import EVALUATORS from './evaluators';

export function calculateFlow(data = {}): number[] {
  const flowCodes: number[] = [];
  try {
    EVALUATORS.forEach((evaluator, index) => {
      if (evaluator(data)) {
        flowCodes.push(index);
      }
    });
  } catch (error) {
    // no-op
  }

  return flowCodes;
}
