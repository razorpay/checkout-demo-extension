let counter = 0;

export function testid(action, name, variant) {
  if (__AUTOTEST_ANNOTATE__) {
    const annotations = {
      'autogen-data-test-id': counter++,
      'autogen-data-test-action': action,
      'autogen-data-test-name': name,
      'autogen-data-test-variant': variant || '',
    };

    return annotations;
  }

  return {};
}
