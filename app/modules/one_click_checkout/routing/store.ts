import { writable, get } from 'svelte/store';
import type { views } from 'one_click_checkout/routing/constants';

type Route = { name: keyof typeof views } | Record<string, never>;

export const activeRoute = writable<Route>({});

export const routes = writable<Route[]>([]);

export const history = writable([]);

export const resetRouting = () => {
  history.set([]);
  activeRoute.set({});
};

export const getRoute = (path: string) => {
  const allRoutes = get(routes);
  return allRoutes.filter((item) => item.name === path)[0];
};
