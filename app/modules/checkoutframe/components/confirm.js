import Confirm from 'ui/components/Confirm.svelte';
import { querySelector } from 'utils/doc';

let confirm = null;

export function isVisible() {
  if (confirm) {
    return confirm.isVisible();
  }
  return false;
}

export function show(props) {
  confirm?.$destroy();
  confirm = new Confirm({
    target: querySelector('#modal-inner'),
    props,
  });
  confirm.show();
}

export function hide(options) {
  if (confirm) {
    confirm.hide(options);
  }
}

export function confirmClose() {
  return new Promise(function (resolve) {
    show({
      onPositiveClick: () => resolve(true),
      onNegativeClick: () => resolve(false),
    });
  });
}
