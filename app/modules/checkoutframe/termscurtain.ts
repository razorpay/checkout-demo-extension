import { isOverlayActive, popStack, pushOverlay } from 'navstack';
import TermsCurtain from 'ui/elements/TermsCurtain.svelte';

type TermCurtainProps = {
  terms?: string;
  loading?: boolean;
  heading?: string;
  image?: string;
  imageAlt?: string;
  termsText?: string;
};

export const show = (props: TermCurtainProps = {}) => {
  hide();
  pushOverlay({
    component: TermsCurtain,
    props,
  });
};

const hide = () => {
  if (isVisible()) {
    popStack();
  }
};

const isVisible = () => {
  return isOverlayActive(TermsCurtain);
};
