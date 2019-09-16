<script>
  // UI imports
  import Icon from 'templates/views/ui/Icon.svelte';

  // Props
  export let icon;
  export let placeholder = '';
</script>

<div class="option-icon">
  <Icon {icon} {placeholder} />
</div>
