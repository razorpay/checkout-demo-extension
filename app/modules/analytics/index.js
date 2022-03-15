import CardEvents from './card';
import CredEvents from './app/cred-events';
import OfferEvents from './offers/events';
import P13NEvents from './p13n/events';
import HomeEvents from './home/events';
import OrderEvents from './order/events';
import MiscEvents from './misc/events';
import DowntimeEvents from './downtime/events';
import ErrorEvents from './errors/events';
import { getTrackMethods, addAnalyticsMethods } from './helpers';
import MetaProperties from './metaProperties';
import Analytics, { Track } from './base-analytics';
import { trackAvailabilty } from './availability';
import OfflineChallanEvents from './offline';

let Events = getTrackMethods();
Events = addAnalyticsMethods(Events);

export default Analytics;

export {
  CardEvents,
  DowntimeEvents,
  Events,
  HomeEvents,
  MetaProperties,
  ErrorEvents,
  MiscEvents,
  OfferEvents,
  OrderEvents,
  P13NEvents,
  Track,
  CredEvents,
  trackAvailabilty,
  OfflineChallanEvents,
};
