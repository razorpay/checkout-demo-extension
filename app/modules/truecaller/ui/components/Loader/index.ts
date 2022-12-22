import { isOverlayActive, popStack, pushOverlay } from 'navstack';
import * as Confirm from 'checkoutframe/components/confirm.js';
import Loader from './Loader.svelte';

// i18n
import { t } from 'svelte-i18n';
import { get } from 'svelte/store';
import {
  CONFIRM_CANCEL_LOGIN_TITLE,
  CONFIRM_CANCEL_LOGIN_MESSAGE,
} from 'truecaller/i18n/labels';

type LoaderProps = {
  loading?: boolean;
  onDismiss?: Function;
};

export const show = (props: LoaderProps = {}) => {
  hide();
  pushOverlay({
    component: Loader,
    props: {
      onBackPressed: () => {
        const _t = get(t);
        Confirm.confirmClose({
          heading: _t(CONFIRM_CANCEL_LOGIN_TITLE),
          message: _t(CONFIRM_CANCEL_LOGIN_MESSAGE),
        })
          .then(function (close) {
            if (close) {
              hide();

              if (typeof props.onDismiss === 'function') {
                props.onDismiss();
              }
            }
          })
          .catch((error) => {
            // no-op
          });
      },
    },
  });
};

export const hide = () => {
  if (Confirm.isVisible()) {
    popStack();
  }

  if (isVisible()) {
    popStack();
  }
};

const isVisible = () => {
  return isOverlayActive(Loader);
};
