import RazorpayCluster from 'ui/tabs/home/RazorpayCluster.svelte';
import { render } from '@testing-library/svelte';
import { singleBlock } from './__mocks__/data';

describe('Razorpay Cluster', () => {
  it('should be rendered', async () => {
    const result = render(RazorpayCluster, {
      props: singleBlock,
    });
    expect(result).toBeTruthy();
  });
  it('Should render Razorpay Cluster', async () => {
    const { getByText, container } = render(RazorpayCluster, {
      props: singleBlock,
    });

    expect(
      container.querySelector('[data-block="rzp.cluster"]')
    ).toBeInTheDocument();
    expect(getByText('Cards, UPI, and Netbanking')).toBeInTheDocument();
    expect(container.querySelector('[method="card"]')).toBeInTheDocument();
    expect(container.querySelector('[method="upi"]')).toBeInTheDocument();
    expect(
      container.querySelector('[method="netbanking"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[method="wallet"]')
    ).not.toBeInTheDocument();
    expect(container.querySelector('[method="emi"]')).not.toBeInTheDocument();
  });
});
