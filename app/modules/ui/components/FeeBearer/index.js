import { pushOverlay } from 'navstack';
import FeeBearerView from './index.svelte';

export default function showFeeBearer(props) {
  pushOverlay({
    component: FeeBearerView,
    props,
  });
}
