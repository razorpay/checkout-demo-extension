import { makeUrl } from 'common/helper';
import { Track } from 'analytics';

describe('Make Url', () => {
  it('should not make session token url for non standard checkout', function () {
    Track.props.library = 'razorpayjs';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should make session token url for standard checkout', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?session_token=DEMO_SESSION_TOKEN'
    );
  });

  it('should make session token url for hosted checkout', function () {
    Track.props.library = 'hosted';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?session_token=DEMO_SESSION_TOKEN'
    );
  });

  it('should not make session token url for standard checkout when session token is not present', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = '';
    expect(makeUrl('preferences')).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should not make session token url for standard checkout when explicitly disabled', function () {
    Track.props.library = 'checkoutjs';
    global.session_token = '';
    expect(makeUrl('preferences', false)).toBe(
      'https://api.razorpay.com/v1/preferences'
    );
  });

  it('should append query param when a query param already exists', function () {
    Track.props.library = 'hosted';
    global.session_token = 'DEMO_SESSION_TOKEN';
    expect(makeUrl('preferences?key=value')).toBe(
      'https://api.razorpay.com/v1/standard_checkout/preferences?key=value&session_token=DEMO_SESSION_TOKEN'
    );
  });
});
