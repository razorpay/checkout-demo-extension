import { getSDKMeta } from 'checkoutstore/native';
import { getDevice, getOS } from 'common/useragent';

export function getAgentPayload(option?: { cred: boolean }) {
  const { platform } = getSDKMeta();

  // for cred any mobile platform to send as mobile
  return {
    '_[agent][platform]': platform,
    '_[agent][device]': option?.cred
      ? getDevice() !== 'desktop'
        ? 'mobile'
        : 'desktop'
      : getDevice(),
    '_[agent][os]': getOS(),
  };
}
