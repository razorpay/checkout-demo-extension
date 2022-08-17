import { render } from '@testing-library/svelte';
import AddressStatusIndicatorSvelte from 'one_click_checkout/coupons/ui/components/AddressStatusIndicator.svelte';

describe('Address status indicator tests', () => {
  it('should render loader with text', async () => {
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

  it('should not render serviceable message if serviceability has not changed', async () => {
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

    const serviceableNode = el.findByTestId('address-serviceable-message');
    await expect(serviceableNode).rejects.toThrow(
      'Unable to find an element by: [data-testid="address-serviceable-message"]'
    );
  });

  it('should render serviceable message', async () => {
    const el = render(AddressStatusIndicatorSvelte, {
      loading: false,
      serviceable: false,
    });

    el.component.$$set({
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

  it('should render unserviceable message', async () => {
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
