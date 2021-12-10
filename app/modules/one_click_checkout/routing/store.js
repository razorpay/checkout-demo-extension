import { writable, get } from 'svelte/store';

export const activeRoute = writable({});

export const routes = writable([]);

export const history = writable([]);

export const resetRouting = () => {
  history.set([]);
  activeRoute.set({});
};

export const getRoute = (path) => {
  const allRoutes = get(routes);
  return allRoutes.filter((item) => item.name === path)[0];
};
