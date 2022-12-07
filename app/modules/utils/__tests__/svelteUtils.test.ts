import { render } from '@testing-library/svelte';
import { getComponentProps } from '../svelteUtils';
import ExpiryField from 'ui/elements/fields/card/ExpiryField.svelte';
describe('#getComponentProps', () => {
  test('extract property', () => {
    const result = render(ExpiryField, {
      props: {
        id: 'card_expiry',
        name: 'card[expiry]',
      },
    });
    expect(getComponentProps(result.component, 'ref')).toBeDefined();
  });

  test('extract invalid property', () => {
    const result = render(ExpiryField, {
      props: {
        id: 'card_expiry',
        name: 'card[expiry]',
      },
    });
    expect(getComponentProps(result.component, 'ref1')).toBeUndefined();
  });
});
