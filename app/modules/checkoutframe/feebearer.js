import FeeBearer from 'templates/views/feebearer.svelte';

export default function FeeBearerView({target, data}) {
  var feeBearer = new FeeBearer({target, data});
  this.on = feeBearer.on.bind(feeBearer);
  this.destroy = feeBearer.destroy.bind(feeBearer);
  this.fetchFees = feeBearer.fetchFees.bind(feeBearer);
}
