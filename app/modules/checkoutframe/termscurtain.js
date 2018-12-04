import TermsCurtain from 'templates/views/ui/TermsCurtain.svelte';
const TARGET_QS = '#tnc-wrap';
let view;

export const show = (data = {}) => {
  data.visible = true;

  if (!view) {
    view = new TermsCurtain({
      target: _Doc.querySelector(TARGET_QS),
      data,
    });
  } else {
    view.set(data);
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
