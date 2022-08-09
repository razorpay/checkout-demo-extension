import { render } from '@testing-library/svelte';
import AddressStatusIndicatorSvelte from '../AddressStatusIndicator.svelte';

describe('Address status indicator tests', () => {
  test('it should render loader with text', async () => {
    const el = render(AddressStatusIndicatorSvelte, {
      loading: true,
    });
    const node = el.getByText('Checking delivery availability');

    const serviceableNode = el.findByTestId('address-serviceable-message');
    await expect(serviceableNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-serviceable-message"]'
    );

    const unserviceableNode = el.findByTestId('address-box-unserviceability');
    await expect(unserviceableNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-box-unserviceability"]'
    );

    expect(node).toBeInTheDocument();
  });

  test('it should render serviceable message', async () => {
    const el = render(AddressStatusIndicatorSvelte, {
      loading: false,
      serviceable: true,
    });

    const loaderNode = el.findByTestId('address-widget-loader');
    await expect(loaderNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-widget-loader"]'
    );

    const unserviceableNode = el.findByTestId('address-box-unserviceability');
    await expect(unserviceableNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-box-unserviceability"]'
    );

    const node = el.getByText('Delivery available at given address');

    expect(node).toBeInTheDocument();
  });

  test('it should render unserviceable message', async () => {
    const el = render(AddressStatusIndicatorSvelte, {
      loading: false,
      serviceable: false,
    });
    const node = el.getByText(
      'Order cannot be delivered to this address. Add or change the address.'
    );

    const loaderNode = el.findByTestId('address-widget-loader');
    await expect(loaderNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-widget-loader"]'
    );

    const serviceableNode = el.findByTestId('address-serviceable-message');
    await expect(serviceableNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-serviceable-message"]'
    );

    expect(node).toBeInTheDocument();
  });
});
