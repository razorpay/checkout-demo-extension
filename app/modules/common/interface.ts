/**
 * This provide functionality to communicate with parent window
 */

import { ownerWindow, isIframe } from './constants';

class Interface {
  static source: string;
  static subscriptions: any = {};
  static iframeReference: HTMLIFrameElement;
  static id: string;
  static setId(id: string) {
    Interface.id = id;
    Interface.sendMessage('updateInterfaceId', id);
  }
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
      const updatedData = {
        data,
        id: Interface.id,
        source: Interface.source || 'reset',
      };
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
    const frame =
      Interface.iframeReference && Interface.iframeReference.contentWindow
        ? Interface.iframeReference.contentWindow
        : window;
    if (frame) {
      frame.postMessage(
        JSON.stringify({
          topic,
          data: { data, id: Interface.id, source: 'checkoutjs' },
          time: Date.now(),
          source: 'checkoutjs',
          _module: 'interface',
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
  Interface.subscribe('updateInterfaceId', (data) => {
    Interface.id = data.data;
  });
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
