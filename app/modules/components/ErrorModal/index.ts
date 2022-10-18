import * as Confirm from 'checkoutframe/components/confirm.js';
import { getSession } from 'sessionmanager';
import { isOverlayActive, popStack, pushOverlay } from 'navstack';
import ErrorModal from './ErrorModal.svelte';
import { getOption } from 'razorpay';
import {
  contentStore,
  errorMessageCTA,
  loadingState,
  subContentStore,
  loadedCTA,
  secondaryLoadedCTA,
} from './store';
import { MiscTracker } from 'misc/analytics/events';
import { AnalyticsV2State } from 'analytics-v2';

function defaultCTAClickAction() {
  const session = getSession();
  if (session.payload && session.payload.method === 'upi') {
    if (Confirm.isVisible()) {
      return;
    }
    Confirm.confirmClose().then(function (close) {
      if (close) {
        session.hideErrorMessage(true);
      }
    });
  }
  session.r.focus();
}

let loadingCTAClickAction = defaultCTAClickAction;
let loadedCTAClickAction: () => void;
let secondaryLoadedCTAClickAction: () => void;

export default function triggerErrorModal(
  props: {
    heading?: string;
    loading?: boolean;
    content?: string;
    primaryCTA?: string | { label: string; onClick: () => void };
  } = {}
) {
  closeErrorModal();
  // reset
  const CtaText = getOption('retry') ? 'Try again' : 'Close';
  loadedCTA.set(CtaText);
  setContent();
  setSecondaryLoadedCTA('');
  if (props) {
    setLoadingState(props.loading);
    setHeading(props.heading);
    setContent(props.content);
    if (props.primaryCTA) {
      if (
        typeof props.primaryCTA === 'object' &&
        typeof props.primaryCTA.onClick === 'function'
      ) {
        updatePrimaryCTA(props.primaryCTA.label, props.primaryCTA.onClick);
      } else if (typeof props.primaryCTA === 'string') {
        loadedCTA.set(props.primaryCTA);
      }
    }
  }
  pushOverlay({
    component: ErrorModal,
    props: {
      onCTAClick: () => {
        loadingCTAClickAction?.();
      },
      onSecondaryCTAClick: () => {
        secondaryLoadedCTAClickAction?.();
      },
      onBackPressed: () => {
        // handle loaded cta click
        if (typeof loadedCTAClickAction === 'function') {
          loadedCTAClickAction();
          return;
        }
        const session = getSession();
        session.hideErrorMessage();
      },
    },
  });
}
/**
 * CTA when loading state is false (text link)
 */
export function updateLoadingCTA(label: string, ctaAction: () => void) {
  errorMessageCTA.set(label);
  if (ctaAction) {
    loadingCTAClickAction = ctaAction;
  }
}

/**
 * CTA when loading state is true (button)
 */
export function updatePrimaryCTA(label: string, ctaAction: () => void) {
  loadedCTA.set(label);
  loadedCTAClickAction = ctaAction;
}

export function setHeading(content?: string) {
  contentStore.set(content || '');
}

export function setLoadingState(state?: boolean) {
  loadingState.set(state ?? false);
  if (!state) {
    MiscTracker.RETRY_BUTTON(AnalyticsV2State.selectedInstrumentForPayment);
  }
}

export function closeErrorModal() {
  if (isVisible()) {
    popStack();
  }
}

export function isVisible() {
  return isOverlayActive(ErrorModal);
}

export function setContent(content = '') {
  subContentStore.set(content);
}

export function setSecondaryLoadedCTA(label: string, action?: () => void) {
  secondaryLoadedCTA.set(label);
  secondaryLoadedCTAClickAction = action as () => void;
}
