import TermsCurtain from 'ui/elements/TermsCurtain.svelte';
import { querySelector } from 'utils/doc';

const TARGET_QS = '#tnc-wrap';
let view;

export const show = (props = {}) => {
  props.visible = true;

  if (!view) {
    view = new TermsCurtain({
      target: querySelector(TARGET_QS),
      props,
    });
  } else {
    view.$set(props);
  }
};

export const hide = () => {
  if (!view) {
    return;
  }

  view.$set({
    visible: false,
  });
};

export const isVisible = () => {
  if (!view) {
    return false;
  }

  return view.visible;
};
