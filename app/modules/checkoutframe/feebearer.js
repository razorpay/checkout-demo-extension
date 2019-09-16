import FeeBearer from 'templates/views/feebearer.svelte';

export default function FeeBearerView({ target, props }) {
  var feeBearer = new FeeBearer({ target, props });
  this.$on = feeBearer.$on;
  this.$destroy = feeBearer.$destroy;
  this.fetchFees = feeBearer.fetchFees;
}
