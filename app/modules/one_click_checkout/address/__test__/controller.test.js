import { get } from 'svelte/store';
import { getServiceability } from '../controller';
import { postServiceability } from '../service';
import { savedAddresses } from '../store';

const DEFAULT_ADDRESS = {
  name: 'Razor',
  type: 'shipping_address',
  line1: 'Razorpay',
  line2: 'SJR Cyber Laskar,  Hosur Rd, Adugodi',
  zipcode: '560030',
  city: 'Bengaluru',
  state: 'Karnataka',
  tag: 'Home',
  landmark: '',
  country: 'in',
  contact: '+919353231953',
  source_type: null,
  serviceability: false,
  formattedLine1: 'Razorpay',
  formattedLine2: 'SJR Cyber Laskar,  Hosur Rd, Adugodi',
  formattedLine3: 'Bengaluru, Karnataka, India, 560002',
  id: 'JmkWf0UXgZbMnL',
};

jest.mock('one_click_checkout/address/store', () => {
  const originalModule = jest.requireActual('one_click_checkout/address/store');
  const { writable } = jest.requireActual('svelte/store');
  return {
    __esModule: true,
    ...originalModule,
    savedAddresses: writable([DEFAULT_ADDRESS]),
  };
});

jest.mock('one_click_checkout/address/service', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/address/service'
  );
  return {
    __esModule: true,
    ...originalModule,
    postServiceability: jest.fn(),
  };
});

jest.mock('one_click_checkout/address/sessionInterface', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/address/sessionInterface'
  );
  return {
    __esModule: true,
    ...originalModule,
    postAddressSelection: jest.fn(),
  };
});

describe('Address controller tests', () => {
  describe('getServiceability: fetches serviceability of an address', () => {
    it('should update serviceability to true if address is serviceable', async () => {
      postServiceability.mockResolvedValue({
        560030: {
          serviceability: true,
          cod: true,
          shipping_fee: 1000,
          cod_fee: 1000,
          city: 'Bengaluru',
          state: 'Karnataka',
          state_code: 'KA',
        },
      });

      await getServiceability(DEFAULT_ADDRESS);
      expect(get(savedAddresses)[0].serviceability).toBe(true);
    });

    it('should update serviceability to false, if address is unserviceable', async () => {
      postServiceability.mockResolvedValue({
        560030: {
          serviceability: false,
          cod: true,
          shipping_fee: 1000,
          cod_fee: 1000,
          city: 'Bengaluru',
          state: 'Karnataka',
          state_code: 'KA',
        },
      });

      await getServiceability(DEFAULT_ADDRESS);
      expect(get(savedAddresses)[0].serviceability).toBe(false);
    });

    it('should update serviceability to false, if network failure occurs', async () => {
      postServiceability.mockRejectedValue({
        err: {
          description: 'Network error',
        },
        payload: {
          addresses: [
            {
              zipcode: '560002',
              country: 'in',
            },
          ],
          order_id: 'order_K3puwmKPvocBZL',
        },
      });

      await getServiceability(DEFAULT_ADDRESS);
      expect(get(savedAddresses)[0].serviceability).toBe(false);
    });
  });
});
