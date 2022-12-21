import UpiAppMethodInstrument from 'ui/tabs/home/instruments/UpiAppMethodInstrument.svelte';
import { render } from '@testing-library/svelte';
import { upiInstrumentData } from '../../__test__/__mocks__/data';

describe('UPi App Instrument', () => {
  it('should be rendered', async () => {
    const result = render(UpiAppMethodInstrument, {
      props: { instrument: upiInstrumentData },
    });
    expect(result).toBeTruthy();
  });
  it('Should render UPI App Instrument for Paytm', async () => {
    const { getByText, container } = render(UpiAppMethodInstrument, {
      props: { instrument: upiInstrumentData },
    });

    expect(container.querySelector('[data-type="method"]')).toBeInTheDocument();
    expect(getByText('UPI - PayTM')).toBeInTheDocument();
  });
});
