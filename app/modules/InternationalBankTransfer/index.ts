// utils
import { setView, destroyView } from 'checkoutframe/components';
import { querySelector } from 'utils/doc';

// store
import {
  setSelectedMethod,
  isMethodSelected,
} from 'checkoutstore/screens/intlBankTransfer';

// component
import IntlBankTransferTab from './ui/List.svelte';

// helpers
import { getPreferredMethod } from './helpers';

// constants
import { TAB_NAME } from './constants';

// types
import type { PREFERRED_INSTRUMENT_TYPE } from './types';

export function render(props = {}) {
  const target = querySelector('#form-fields');

  if (!target) {
    return null;
  }

  const intlBankTransfer = new IntlBankTransferTab({
    target,
    props,
  });

  setView(TAB_NAME, intlBankTransfer);

  return intlBankTransfer;
}

export function destroy() {
  destroyView(TAB_NAME);
}

export function preferredMethod(
  instrument: PREFERRED_INSTRUMENT_TYPE | undefined
) {
  const method = getPreferredMethod(instrument);
  if (method && !isMethodSelected()) {
    setSelectedMethod(method);
    return true;
  }
  return false;
}

export { TAB_NAME };
