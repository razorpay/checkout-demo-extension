<script lang="ts">
  import Icon from 'ui/elements/Icon.svelte';
  import cod from 'ui/icons/payment-methods/cod';
  import { getIconColorVariations } from 'one_click_checkout/utils';
  export let disabled;
  const defaultBackgroundColor = '#858585';
  const defaultForegroundColor = '#858585';
  let foregroundColor = defaultForegroundColor;
  let backgroundColor = defaultBackgroundColor;
  let icon = cod(foregroundColor, backgroundColor);
  $: backgroundColor = disabled
    ? defaultBackgroundColor
    : getIconColorVariations().backgroundColor;
  $: foregroundColor = disabled
    ? defaultForegroundColor
    : getIconColorVariations().foregroundColor;
  $: icon = cod(foregroundColor, backgroundColor);
</script>

<Icon {icon} />
