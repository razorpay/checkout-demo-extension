import { getLogoByCountry } from 'account_modal/helper';
import { getIcons } from 'checkoutstore/theme';

jest.mock('checkoutstore/theme', () => ({
  ...jest.requireActual('checkoutstore/theme'),
  getIcons: jest.fn(() => ({
    rzp_brand_logo: 'icon',
    user_protect: 'icon',
    curlec_logo: 'icon',
  })),
  getThemeMeta: jest.fn(() => ({
    icons: {
      rzp_brand_logo: 'icon',
      user_protect: 'icon',
      curlec_logo: 'icon',
    },
  })),
}));

describe('modules/account_modal', () => {
  describe('getLogoByCountry', () => {
    test('should return correct logos for MY country', () => {
      const malaysiaLogos = '<svg>curlec dummy logo svg</svg>';
      (getIcons as jest.Mock).mockReturnValue({
        curlec_logo: malaysiaLogos,
      });

      const logo = getLogoByCountry('MY');
      expect(logo).toEqual([malaysiaLogos]);
    });

    test('should return correct logos for IN country', () => {
      const indianLogos = '<svg>rzp dummy logo svg</svg>';
      (getIcons as jest.Mock).mockReturnValue({
        rzp_brand_logo: indianLogos,
      });

      const logo = getLogoByCountry('IN');
      expect(logo).toEqual([indianLogos]);
    });

    test('should return default logos for country=null', () => {
      const indianLogos = '<svg>rzp dummy logo svg</svg>';
      (getIcons as jest.Mock).mockReturnValue({
        rzp_brand_logo: indianLogos,
      });

      // @ts-ignore
      const logo = getLogoByCountry(null);
      expect(logo).toEqual([indianLogos]);
    });
  });
});
