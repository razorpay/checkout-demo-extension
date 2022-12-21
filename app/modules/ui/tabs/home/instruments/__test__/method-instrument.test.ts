import MethodInstrument from 'ui/tabs/home/instruments/MethodInstrument.svelte';
import { render } from '@testing-library/svelte';
import { cardInstrumentData } from '../../__test__/__mocks__/data';

describe('Method  Instrument', () => {
  it('should be rendered', async () => {
    const result = render(MethodInstrument, {
      props: { instrument: cardInstrumentData },
    });
    expect(result).toBeTruthy();
  });
  it('Should render Card Instrument', async () => {
    const { container } = render(MethodInstrument, {
      props: { instrument: cardInstrumentData },
    });

    expect(container.querySelector('[data-type="method"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="title"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="subtitle"]')).toBeInTheDocument();
  });
});
