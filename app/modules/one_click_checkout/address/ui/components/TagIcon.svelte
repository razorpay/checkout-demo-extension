<script lang="ts">
  import Icon from 'ui/elements/Icon.svelte';
  import home from 'one_click_checkout/address/icons/home';
  import work from 'one_click_checkout/address/icons/work';
  import othersTag from 'one_click_checkout/address/icons/others_tag';
  import { getTheme } from 'one_click_checkout/sessionInterface';
  export let label;
  export let selected = false;
  const iconMap = {
    Home: home,
    Office: work,
    Others: othersTag,
  };
  const defaultForegroundColor = '#333333';
  const backgroundColor = getTheme().backgroundColor;
  let icon;
  let foregroundColor = defaultForegroundColor;
  $: foregroundColor = selected
    ? getTheme().highlightColor
    : defaultForegroundColor;
  $: icon = iconMap[label](foregroundColor, backgroundColor);
</script>

<Icon {icon} />
