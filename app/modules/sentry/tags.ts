import Track from 'analytics/tracker';
import type { Tags } from 'sentry/interfaces';

export function getTags(): Tags {
  let merchant_url = Track.props.referer;

  try {
    // URL constructor can throw in case of invalid url or not being supported in IE
    // hostname is much more relevant than full path, also better for filtering
    merchant_url = new URL(Track.props.referer).hostname;
  } catch (e) {}

  return {
    merchant_url: merchant_url,
  };
}

export function setTags() {
  window.Sentry.setTags(getTags());
}
