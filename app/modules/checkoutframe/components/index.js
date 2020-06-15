import PoweredBy from 'ui/components/PoweredBy.svelte';
import renderNetbankingTab from './netbanking';

let componentsMap = {};

export function render() {
  componentsMap.poweredBy = new PoweredBy({
    target: _Doc.querySelector('#container'),
  });
}

export function destroyAll() {
  componentsMap |> _Obj.loop(destroy);
  componentsMap = {};
}

function destroy(c) {
  c && c.$destroy();
}

function setComponent(key, factory) {
  return () => {
    destroy(componentsMap[key]);
    componentsMap[key] = factory();
  };
}

export const setNetbankingTab = setComponent(
  'netbankingTab',
  renderNetbankingTab
);
