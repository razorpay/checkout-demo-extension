import { isIframe } from 'common/constants';
import Interface from 'common/interface';

// TODO meta listener
export function setMetaInFrame(key: string, value: string | boolean | number) {
  if (isIframe) {
    return;
  }
  Interface.sendMessage('setMeta', {
    key,
    value,
  });
}

export function syncAvailability(
  sessionCreated: boolean,
  sessionErrored: boolean
) {
  if (isIframe) {
    // send to parent
    Interface.publishToParent('syncAvailability', {
      sessionCreated,
      sessionErrored,
    });
  } else {
    // send to frame
    Interface.sendMessage('syncAvailability', {
      sessionCreated,
      sessionErrored,
    });
  }
}
