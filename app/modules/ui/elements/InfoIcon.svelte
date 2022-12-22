<script lang="ts">
  import Icon from 'ui/elements/Icon.svelte';
  import info from 'ui/icons/payment-methods/info';
  export let variant: 'default' | 'red' | 'disabled' = 'default';
  const foregroundColor = {
    default: '#FFFFFF',
    red: '#EE1A32',
    disabled: '#858585',
  };
  let icon: string;
  $: icon = info(foregroundColor[variant]);
</script>

<Icon {icon} />
