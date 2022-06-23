/**
 * This provide functionality to communicate with parent window
 */

import { ownerWindow, isIframe } from './constants';
import Tracker from 'analytics/tracker';

class Interface {
  static source: string;
  static subscriptions: any = {};
  static iframeReference: HTMLIFrameElement;
  static subscribe(subscribeTopic: string, fx: (data: any) => void) {
    if (!Interface.subscriptions[subscribeTopic]) {
      Interface.subscriptions[subscribeTopic] = [];
    }
    Interface.subscriptions[subscribeTopic].push(fx);
  }

  static resetSubscriptions() {
    Interface.subscriptions = {};
  }

  static publishToParent(topic: string, data: any = {}) {
    if (ownerWindow) {
      if (!Interface.source) {
        Interface.updateSource();
      }
      let updatedData = data;
      if (typeof updatedData !== 'object' || !updatedData) {
        updatedData = {
          data,
        };
      }
      updatedData.source = Interface.source || 'reset';
      updatedData.id = Tracker.id;
      const finalMessage = JSON.stringify({
        data: updatedData,
        topic,
        source: updatedData.source,
        time: Date.now(),
      });
      ownerWindow.postMessage(finalMessage, '*');
    }
  }

  static updateSource() {
    if (isIframe && window && window.location) {
      Interface.source = 'checkout-frame';
    }
  }

  static sendMessage(topic: string, data: any) {
    if (Interface.iframeReference && Interface.iframeReference.contentWindow) {
      Interface.iframeReference.contentWindow.postMessage(
        JSON.stringify({
          topic,
          data: { data, id: Tracker.id, source: 'checkoutjs' },
          time: Date.now(),
          source: 'checkoutjs',
        }),
        '*'
      );
    }
  }
}

Interface.updateSource();
// initialize the listener
if (isIframe) {
  Interface.publishToParent('ready');
}
window.addEventListener('message', function (e) {
  // Get the sent data
  let inputData: any = {};
  try {
    inputData = JSON.parse(e.data);
  } catch (e) {
    // e
  }
  const { topic, data } = inputData || {};
  if (topic && Interface.subscriptions[topic]) {
    Interface.subscriptions[topic].forEach(
      (callbackFx: (data: any) => void) => {
        callbackFx(data);
      }
    );
  }
});

export default Interface;
