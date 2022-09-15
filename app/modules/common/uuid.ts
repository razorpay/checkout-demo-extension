// sentry's uuid4 generator. Refer: https://github.com/getsentry/sentry-javascript/blob/9b02afb232278241e463586f1a4a2cc3e1d27b8d/packages/utils/src/misc.ts#L20
export function uuid4() {
  const crypto = window.crypto || window.msCrypto;

  if (!(crypto === void 0) && crypto.getRandomValues) {
    // Use window.crypto API if available
    const arr = new Uint16Array(8);
    crypto.getRandomValues(arr);

    // set 4 in byte 7
    // eslint-disable-next-line no-bitwise
    arr[3] = (arr[3] & 0xfff) | 0x4000;
    // set 2 most significant bits of byte 9 to '10'
    // eslint-disable-next-line no-bitwise
    arr[4] = (arr[4] & 0x3fff) | 0x8000;

    const pad = (num: number) => {
      let v = num.toString(16);
      while (v.length < 4) {
        v = `0${v}`;
      }
      return v;
    };

    return (
      pad(arr[0]) +
      pad(arr[1]) +
      pad(arr[2]) +
      pad(arr[3]) +
      pad(arr[4]) +
      pad(arr[5]) +
      pad(arr[6]) +
      pad(arr[7])
    );
  }
  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
