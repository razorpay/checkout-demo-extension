import { getCustomDowntimeMessage } from 'upi/ui/components/QRWrapper/utils';

describe('Test getCustomDowntimeMessage', () => {
  test('Test getCustomDowntimeMessage when apps with downtime', () => {
    const appShortCodes: string[] = [];
    const locale = 'en';
    expect(getCustomDowntimeMessage(appShortCodes, locale)).toBe('');
  });
  test('Test getCustomDowntimeMessage when apps without downtime', () => {
    const appShortCodes: string[] = ['google_pay', 'phonepe'];
    const locale = 'en';
    expect(getCustomDowntimeMessage(appShortCodes, locale)).toBe(
      'Google Pay, PhonePe are facing issues. Please use other UPI apps.'
    );
  });
});
