<script>
  import EmiPlanCard from 'ui/tabs/emi/emiplancard.svelte';
  export let plans;
  export let bank;
  export let expanded;
  export let amount;
  export let provider;
  export let expand;
  export let title;

  $: {
    plans = (plans || []).sort((a, b) => {
      if (a.duration < b.duration) {
        return -1;
      }
      return 1;
    });
  }
</script>

<h3>{title}</h3>
<div class="emi-plans-list expandable-card-list">
  {#each plans as plan, index (plan.duration)}
    <EmiPlanCard
      {plan}
      {bank}
      expanded={plan.duration === expanded}
      {amount}
      {provider}
      on:click={() => expand(plan)}
    />
  {/each}
</div>
