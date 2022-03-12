import { headerVisible } from 'one_click_checkout/header/store';

export const hideHeader = () => {
  headerVisible.set(false);
};

export const showHeader = () => {
  headerVisible.set(true);
};
