import { render } from '@testing-library/svelte';
import PostPaymentScreen from './index';

jest.mock('topbar');

describe('PostPaymentScreen', () => {
  test('render PostPaymentScreen without error', () => {
    const results = render(PostPaymentScreen, {
      props: {},
    });
    expect(results).toBeTruthy();
  });
});
