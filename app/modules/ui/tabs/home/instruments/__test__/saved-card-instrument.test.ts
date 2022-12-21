import SavedCardInstrument from 'ui/tabs/home/instruments/SavedCardInstrument.svelte';
import { render } from '@testing-library/svelte';
import { setupPreferences } from 'tests/setupPreferences';
import { savecardInstrument } from '../../__test__/__mocks__/data';

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('Radio Instrument', () => {
  beforeEach(() => {
    setupPreferences('loggedin', razorpayInstance, {
      one_cc_capture_gstin: 'false',
    });
  });

  it('should be rendered', async () => {
    const result = render(SavedCardInstrument, {
      props: { instrument: savecardInstrument },
    });
    expect(result).toBeTruthy();
  });
  it('Should render Radio Instrument for UPI Collect', async () => {
    const { container } = render(SavedCardInstrument, {
      props: { instrument: savecardInstrument },
    });

    expect(container.querySelector('[slot="title"]')).toBeInTheDocument();
  });
});
