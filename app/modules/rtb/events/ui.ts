import { getEventsName } from './helper';

const rtbBannerEvents = {
  BANNER_SHOW: 'banner:show',
  BANNER_CLICK: 'banner:click',
};

const rtbOverlayEvents = {
  OVERLAY_SHOW: 'overlay:show',
  OVERLAY_HIDE: 'overlay:hide',
};

const events = {
  ...rtbBannerEvents,
  ...rtbOverlayEvents,
};

export default getEventsName('rtb', events);
