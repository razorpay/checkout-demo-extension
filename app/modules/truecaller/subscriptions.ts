import {
  TRIGGER_TRUECALLER_INTENT_EVENT,
  TRUECALLER_DETECTION_DELAY,
} from 'truecaller/constants';
import Interface from 'common/interface';
import { redirectTo } from 'utils/doc';

export function subscribeToTruecallerEvent() {
  Interface.subscribe(TRIGGER_TRUECALLER_INTENT_EVENT, (event) => {
    const { url } = event.data || {};

    try {
      redirectTo({
        method: 'GET',
        content: '',
        url: url,
      });
    } catch (e) {
      // no-op, fail silently
    }

    // Since in a webpage we can't detect if an app is present or not explicitly
    // so we have to figure out based on document focus. When truecaller native modal
    // comes up, the current document gets out of focus.
    setTimeout(() => {
      Interface.sendMessage(`${TRIGGER_TRUECALLER_INTENT_EVENT}:finished`, {
        focused: document.hasFocus(),
      });
    }, TRUECALLER_DETECTION_DELAY);
  });
}
