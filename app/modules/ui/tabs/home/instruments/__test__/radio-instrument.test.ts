import RadioInstrument from 'ui/tabs/home/instruments/RadioInstrument.svelte';
import { render } from '@testing-library/svelte';
import { upiCollectData } from '../../__test__/__mocks__/data';

describe('Radio Instrument', () => {
  it('should be rendered', async () => {
    const result = render(RadioInstrument, {
      props: { instrument: upiCollectData },
    });
    expect(result).toBeTruthy();
  });
  it('Should render Radio Instrument for UPI Collect', async () => {
    const { getByText, container } = render(RadioInstrument, {
      props: { instrument: upiCollectData },
    });

    expect(
      container.querySelector('[data-id="Kob9DrAUT2nabc"]')
    ).toBeInTheDocument();
    expect(getByText('UPI - 8888888888@ybl')).toBeInTheDocument();
    expect(
      container.querySelector('[class="radio-display"]')
    ).toBeInTheDocument();
  });
});
