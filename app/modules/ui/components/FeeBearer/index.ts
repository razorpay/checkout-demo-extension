import { pushOverlay } from 'navstack';
import FeeBearerView from './FeeBearerView.svelte';
import type { FeeBearerResponse } from './type';

export default function showFeeBearer(props: {
  paymentData: Partial<FeeBearerResponse['input']>;
  onContinue: (arg: FeeBearerResponse['input']) => void;
}) {
  pushOverlay({
    component: FeeBearerView,
    props,
  });
}
