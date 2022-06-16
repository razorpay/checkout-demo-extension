<script>
  import Icon from 'ui/elements/Icon.svelte';
  import cod from 'ui/icons/payment-methods/cod';
  import { getTheme } from 'one_click_checkout/sessionInterface';
  export let disabled;
  const defaultBackgroundColor = '#858585';
  const defaultForegroundColor = '#858585';
  let foregroundColor = defaultForegroundColor;
  let backgroundColor = defaultBackgroundColor;
  let icon = cod(foregroundColor, backgroundColor);
  $: backgroundColor = disabled
    ? defaultBackgroundColor
    : getTheme().backgroundColor;
  $: foregroundColor = disabled
    ? defaultForegroundColor
    : getTheme().foregroundColor;
  $: icon = cod(foregroundColor, backgroundColor);
</script>

<Icon {icon} />
