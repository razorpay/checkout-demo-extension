<script>
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';

  // Props
  export let icon;
  export let placeholder = '';
</script>

<div class="option-icon">
  <Icon {icon} {placeholder} />
</div>
