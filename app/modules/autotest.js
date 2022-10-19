export default function autotest(name, variant) {
  // eslint-disable-next-line no-undef
  if (__AUTOTEST_ANNOTATE__) {
    const annotations = {
      'autogen-name': String(name),
      'autogen-variant': String(variant || ''),
    };

    return annotations;
  }

  return {};
}
