import NewMethodList from 'ui/tabs/home/NewMethodsList.svelte';
import { render } from '@testing-library/svelte';
import { setupPreferences } from 'tests/setupPreferences';
import { blocks } from 'checkoutstore/screens/home';
import { blockData1 } from './__mocks__/data';

let razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  get: jest.fn(),
  getMode: jest.fn(),
};

describe('New Method List', () => {
  beforeEach(() => {
    setupPreferences('loggedin', razorpayInstance, {
      one_cc_capture_gstin: 'false',
    });
  });

  it('should be rendered', async () => {
    const result = render(NewMethodList);
    expect(result).toBeTruthy();
  });
  it('Should render New Method List with methods including Cards , UPI and Wallet', async () => {
    blocks.set(blockData1);
    const { container, getByText } = render(NewMethodList);
    expect(getByText('Cards, UPI & More')).toBeInTheDocument();
    expect(getByText('Wallet')).toBeInTheDocument();
    expect(container.querySelector('[role="list"]')).toBeInTheDocument();
  });

  it('Should not render any method in case of wrong config', async () => {
    const data = [
      {
        code: 'rzp.test',
        _type: 'block',
        instruments: [
          {
            _ungrouped: [{}],

            id: '1d5e83cc_rzp.cluster_1_0_test_false',
          },
        ],
      },
    ] as any;
    blocks.set(data);

    const { container, queryByText } = render(NewMethodList);
    expect(queryByText('Test')).not.toBeInTheDocument();
  });
});
