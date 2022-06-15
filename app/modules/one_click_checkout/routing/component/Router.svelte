<script lang="ts">
  import { onMount } from 'svelte';
  import Route from 'one_click_checkout/routing/component/Route.svelte';
  import {
    activeRoute,
    routes as allRoutes,
  } from 'one_click_checkout/routing/store';

  export let routes = [];

  onMount(() => {
    allRoutes.set(routes);
  });
</script>

<Route currentRoute={$activeRoute} />
