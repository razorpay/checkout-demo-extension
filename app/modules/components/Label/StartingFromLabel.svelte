<script lang="ts">
  import { formatTemplateWithLocale } from 'i18n';
  import { locale } from 'svelte-i18n';
  import { STARTING_FROM_LABEL } from 'ui/labels/emi';
  import Label from './Label.svelte';

  export let startingAt = 10;
  export let expanded = false;

  let roundedInterest = startingAt;
  let text;
  let props;

  // Truncate decimal digits to specified number of digits
  // Expect float number and fixed number of digits after decimal points
  // Eg 12.99 get changed to => 12.9
  const toFixed = (num: number, fixed: number): number => {
    fixed = fixed || 0;
    fixed = Math.pow(10, fixed);
    return Math.floor(num * fixed) / fixed;
  };

  $: {
    roundedInterest = (startingAt * 10) / 10;
    roundedInterest = toFixed(roundedInterest, 1);
    text = formatTemplateWithLocale(
      STARTING_FROM_LABEL,
      { amount: roundedInterest },
      $locale
    );
    props = {
      text,
      type: 'secondary',
      expanded,
    };
  }
</script>

<svelte:component this={Label} {...props} />
