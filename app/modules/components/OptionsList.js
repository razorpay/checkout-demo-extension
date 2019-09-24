/* global makeVisible, makeHidden */
import OptionsView from 'templates/views/ui/OptionsList.svelte';
import { SHOWN_CLASS } from 'common/constants';

let view;

function $destroy() {
  if (view && view.$destroy) {
    view.$destroy();
  }
}

export function hide() {
  if (view) {
    view.$set({ visible: false });
    if (!(_Doc.querySelector('#emi-wrap') |> _El.hasClass(SHOWN_CLASS))) {
      makeHidden('#overlay');
    }
  }
}

export function show(options) {
  let { props, target } = options;

  $destroy();

  view = new OptionsView({
    target: target,
    props,
  });

  makeVisible('#overlay');
}
