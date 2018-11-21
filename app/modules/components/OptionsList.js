/* global makeVisible, makeHidden */
import OptionsView from 'templates/views/ui/OptionsList.svelte';
import { SHOWN_CLASS } from 'common/constants';

const defaultOptions = {
  data: {},
  onSelect: () => {},
};

let view;

function destroy() {
  if (view && view.destroy) {
    view.destroy();
  }
}

export function hide() {
  if (view) {
    view.set({ visible: false });
    if (!(_Doc.querySelector('#emi-wrap') |> _El.hasClass(SHOWN_CLASS))) {
      makeHidden('#overlay');
    }
  }
}

export function show(options) {
  options = {} |> _Obj.extend(defaultOptions) |> _Obj.extend(options);
  let { data, target, onSelect } = options;

  destroy();

  view = new OptionsView({
    target: target,
    data,
    methods: {
      onSelect: value => {
        onSelect.call(null, value);
        hide();
      },
    },
  });

  makeVisible('#overlay');
}
