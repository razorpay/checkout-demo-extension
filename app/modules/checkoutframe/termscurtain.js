import TermsCurtain from 'templates/views/ui/TermsCurtain.svelte';
const TARGET_QS = '#tnc-wrap';
let view;

export const show = (props = {}) => {
  props.visible = true;

  if (!view) {
    view = new TermsCurtain({
      target: _Doc.querySelector(TARGET_QS),
      props,
    });
  } else {
    view.set(props);
  }
};

export const hide = () => {
  if (!view) {
    return;
  }

  view.set({
    visible: false,
  });
};

export const isVisible = () => {
  if (!view) {
    return false;
  }

  return view.get().visible;
};
