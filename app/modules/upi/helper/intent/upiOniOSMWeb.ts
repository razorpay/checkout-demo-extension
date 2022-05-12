import { Safari } from 'common/useragent';
import {
  APP_DETECTED_FURTHER_STEPS_TIMEOUT,
  APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT,
  upiBackCancel,
  USER_CONSENT_FOR_NAVIGATION_TIMEOUT,
} from 'upi/constants';
import {
  captureTrace,
  TRACES,
  trackTabDestroyOniOSMWeb,
  storeUpiPopupEvents,
  trackUserCancelOniOSMweb,
} from 'upi/events';

export const upiPopupEvents = {
  parent: [] as string[],
  child: [] as string[],
  reset() {
    storeUpiPopupEvents(this.child, this.parent, true);
    this.child = [];
    this.parent = [];
    return true;
  },
  getChild() {
    return this.child;
  },
  getParent() {
    return this.parent;
  },
  addToChild(data: string) {
    this.child.push(data);
  },
  addToParent(data: string) {
    this.parent.push(data);
  },
};

/**
 * Safari Blocks all the popup/window.open requests from asynchronous function calls.
 * Since tryIntentUrl function parent/grand-parent can be async, window.open doesn't work
 * Hence before payment creation itself, we will create the window and utilise after payment creation and destroy on success/failure
 */
export const upiPopUpForiOSMWeb: {
  instance: null | Window;
  parentName: string;
  reset: () => void;
  createWindow: (context: string, callBackName: string) => Window | null;
  destroyWindow: (forceClose?: boolean) => void;
  setUrl: (url: string) => Window | null;
} = {
  parentName: 'rzpCheckout',
  instance: null,
  reset() {
    this.instance = null;
  },
  createWindow(content = '', callBackName = '') {
    captureTrace(TRACES.IOS_MWEB_TAB_CREATED);
    this.reset();
    if (!window.name) {
      window.name = this.parentName;
    }
    /**
     * Here Safari : is a regex that tests for safari or vendor as apple
     * Since all browsers in iOS has vendor as apple its safe to use for iOS mWeb
     */
    if ((!this.instance || !(this.instance as any)?.window) && Safari) {
      (this.instance as any) = window.open('', '_blank') as Window;
    }

    if (this.instance) {
      if (callBackName) {
        window.addEventListener('focus', () => {
          upiPopupEvents.addToParent('focus');
        });
        window.addEventListener('blur', () => {
          upiPopupEvents.addToParent('blur');
        });
        /**
         * we are getting
         * beforeunload : setTimeout from tryIntentUrl, manual close
         * and when prompt from OS are shown then we have focus and blur triggered.
         * on button click we have goback
         */
        (window as any)[callBackName] = (
          action: 'beforeunload' | 'goBack' | 'focus' | 'blur',
          event: any
        ) => {
          upiPopupEvents.addToChild(action);

          if (action === 'goBack') {
            trackUserCancelOniOSMweb();
            this.destroyWindow();
          }
        };
      }
      if (content) {
        this.instance.document.write(content);
      }

      if (
        this.instance.window.history &&
        this.instance.window.history.pushState
      ) {
        // url should be of same origin
        this.instance.window.history.pushState(
          { Url: 'wait.html' },
          'Razorpay',
          'wait.html'
        );
      }
    }
    return this.instance;
  },
  destroyWindow(forceClose = false) {
    trackTabDestroyOniOSMWeb(forceClose);
    if (this.instance && this.instance.window) {
      if (forceClose) {
        // this over-writing will destroy any system pops present and empty the page
        this.instance = this.instance.open('about:blank', '_self');
      }
      const _i = setInterval(() => {
        if (this.instance && this.instance.document) {
          this.instance.window.close();
        } else {
          clearInterval(_i);
        }
      }, 500);

      // This is the maximum time we try for force closing the new tab
      setTimeout(() => {
        clearInterval(_i);
        this.reset();
      }, 5000);
    }
  },
  setUrl(url) {
    if (!this.instance || !this.instance.document) {
      return null;
    }
    this.instance.location = url;
    captureTrace(TRACES.IOS_MWEB_TAB_URL_SET);
    return this.instance;
  },
};

/**
 * Test Deeplink Urls:
 * Google Maps
 * 'comgooglemaps://?center=40.765819,-73.975866&zoom=14&views=traffic'
 * Apple Maps
 * 'maps://?address=One+Apple+Park+Way,Cupertino,United+States'
 * Test Universal Link
 *  'http://maps.apple.com/?sll=50.894967,4.341626&z=10&t=s
 */
//http://maps.apple.com/?sll=50.894967,4.341626&z=10&t=s

export const tryOpeningIntentUrlOniOSMWeb = (intentUrl: string) => {
  /**
   * Events Reset is mandatory as we completely relay on them
   */
  upiPopupEvents.reset();

  upiPopUpForiOSMWeb.setUrl(intentUrl);

  return new Promise((resolve) => {
    const secondTimer = setTimeout(() => {
      /**
       * If App is absent firstTimer would have cleared this timeout
       * And by this function execution, system confirmed the app presence but
       * And presented the popup to user in checkout window only
       * Waiting for user consent to navigate [Cancel, Open]
       */

      /**
       * Since we don't want the tab we opened, re-trigger destroy on safer side
       */
      upiPopUpForiOSMWeb.destroyWindow();

      const parentEvents = upiPopupEvents.getParent();

      if (parentEvents.length === 0) {
        /**
         * Since popup is already present the following will happen
         * on OPEN:
         * The system will close popup first, which causes focus on checkout and
         * System pushes the user to respective app, which causes blur on checkout
         * But there can be a delay in the events
         *
         * On CANCEL:
         * The system popup gets closed, firing focus event on checkout.
         *
         * Observing above, both actions fires focus on checkout but, the key is we have to wait till the focus fired,
         * hence we will add a event listener on focus event.
         * Are we done? Nope, as explained above, we have ambiguity in step forward
         * Hence set a timer after focus to wait blur / nothing to happen as we observed focus-> blue delay is 500ms due to navigation by OS
         * Yet, we will wait for X[USER_CONSENT_FOR_NAVIGATION_TIMEOUT] amount of time after focus and decide on user-action.
         *
         */
        captureTrace(TRACES.IOS_MWEB_TAB_NO_PARENT_EVENTS);
        window.addEventListener('focus', () => {
          setTimeout(() => {
            captureTrace(TRACES.IOS_MWEB_PARENT_FOCUS_TIMEOUT, {
              parentEvents,
            });
            if (parentEvents.length === 1 && parentEvents.includes('focus')) {
              captureTrace(TRACES.IOS_MWEB_CONSENT_CANCELLED);
              // CANCEL
              resolve({
                canProceed: false,
                reason: upiBackCancel,
              });
            } else if (
              parentEvents.length === 2 &&
              parentEvents[0] === 'focus' &&
              parentEvents[1] === 'blur'
            ) {
              captureTrace(TRACES.IOS_MWEB_CONSENT_OPENED);
              // OPEN
              resolve(true);
            }
          }, USER_CONSENT_FOR_NAVIGATION_TIMEOUT);
        });
      }
    }, APP_DETECTED_FURTHER_STEPS_TIMEOUT);
    const firstTimer = setTimeout(() => {
      const events = upiPopupEvents.getChild();
      captureTrace(TRACES.IOS_MWEB_FIRST_TIMEOUT, {
        events,
      });
      /**
       * In New tab, after we set url,
       * If there is any blue, means system popup opened as app is absent
       * And if focus is also triggered means user clicked on OK and waiting to get back
       * And we can cancel the payment as the app is not present
       *
       * If user didn't want to proceed then he can opt goBack and cancel the payment
       */
      if (events.includes('goBack') || events.includes('blur')) {
        upiPopUpForiOSMWeb.destroyWindow(true);
        clearInterval(secondTimer);
        resolve(false);
      } else {
        /**
         * If the user is already given consent, webkit is trying to cache
         * and don't ask next time
         * This is bottleneck for us to confirm cancel and open
         * Hence product team is ready to lose negative flow for positive to work
         * So resolve promise if app presence detected and hit poll url
         * Note: If user cancels in popup or does -ve actions in the upi app, we left no clue :(
         * Second timer is not required anymore but, its letting it as is to avoid further issues
         * Resolving already resolved promise doesn't creates issue.
         */
        resolve(true);
      }
    }, APP_DETECTION_OR_MANUAL_CANCEL_TIMEOUT);
  });
};
