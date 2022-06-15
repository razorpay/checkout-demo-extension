<script lang="ts">
  export let currentRoute;
  let props;
  $: {
    props = currentRoute.props;
  }
</script>

<svelte:component this={currentRoute.component} {...props} />
