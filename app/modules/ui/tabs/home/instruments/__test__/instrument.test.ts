import Instrument from 'ui/tabs/home/instruments/Instrument.svelte';
import { render } from '@testing-library/svelte';
import {
  cardInstrumentData,
  upiInstrumentData,
} from '../../__test__/__mocks__/data';

describe('Instrument', () => {
  it('should be rendered', async () => {
    const result = render(Instrument, { props: cardInstrumentData });
    expect(result).toBeTruthy();
  });
  it('Should render Method Instrument', async () => {
    const { container } = render(Instrument, { props: cardInstrumentData });

    expect(container.querySelector('[data-type="method"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="title"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="subtitle"]')).toBeInTheDocument();
  });

  it('Should render Method Instrument', async () => {
    const { container } = render(Instrument, { props: cardInstrumentData });

    expect(container.querySelector('[data-type="method"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="title"]')).toBeInTheDocument();
    expect(container.querySelector('[slot="subtitle"]')).toBeInTheDocument();
  });

  it('Should render UPI App Instrument', async () => {
    const { container, getByText } = render(Instrument, {
      instrument: upiInstrumentData,
    });

    expect(container.querySelector('[data-type="method"]')).toBeInTheDocument();
    expect(getByText('UPI - PayTM')).toBeInTheDocument();
  });
});
