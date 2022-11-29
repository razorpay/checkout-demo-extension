import Analytics from 'analytics';
import {
  getAppFromPackageName,
  trackAppImpressions,
  trackUPIIntentFailure,
} from 'common/upi';

describe('getAppFromPackageName', () => {
  it('test for whatsapp', () => {
    expect(getAppFromPackageName('com.whatsapp.w4b')).toEqual(
      expect.objectContaining({
        app_name: 'WhatsApp Business UPI',
        package_name: 'com.whatsapp.w4b',
        shortcode: 'whatsapp-biz',
      })
    );
  });

  it('test for gpay', () => {
    expect(
      getAppFromPackageName('com.google.android.apps.nbu.paisa.user')
    ).toEqual(
      expect.objectContaining({
        app_name: 'Google Pay',
        package_name: 'com.google.android.apps.nbu.paisa.user',
        shortcode: 'google_pay',
      })
    );
  });
});

describe('trackAppImpressions , trackUPIIntentFailure', () => {
  const analytics = (Analytics.track = jest.fn());
  it('test for Tracking method', () => {
    trackAppImpressions([{ package_name: 'com.truecaller' }]);
    expect(analytics).toHaveBeenCalledWith('upi:app:truecaller:show');
  });
  it('test for UPI Intent Failure', () => {
    trackUPIIntentFailure('com.truecaller');
    expect(analytics).toHaveBeenCalledWith('upi:app:intent:cancel', {
      data: { package_name: 'com.truecaller' },
    });
  });
});
