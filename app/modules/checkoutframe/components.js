import PoweredBy from 'ui/components/PoweredBy.svelte';

let components = [];

export function render() {
  renderComponent(PoweredBy, '#container');
}

function renderComponent(constructor, target, props = {}) {
  components.push(
    new constructor({
      target: _Doc.resolveElement(target),
      props,
    })
  );
}

export function destroy() {
  components |> _Arr.loop(c => c.$destroy());
  components = [];
}
