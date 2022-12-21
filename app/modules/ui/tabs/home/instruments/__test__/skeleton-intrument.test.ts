import SkeletonInstrument from 'ui/tabs/home/instruments/SkeletonInstrument.svelte';
import { render } from '@testing-library/svelte';

describe('Skeleton Instrument', () => {
  it('should be rendered', async () => {
    const result = render(SkeletonInstrument);
    expect(result).toBeTruthy();
  });
  it('Should render Skeleton Instrument with loading', async () => {
    const { container } = render(SkeletonInstrument);

    expect(
      container.querySelector('[data-type="skeleton"]')
    ).toBeInTheDocument();
  });
});
