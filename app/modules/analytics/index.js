import CardEvents from './card';
import OfferEvents from './offers/events';
import P13NEvents from './p13n/events';
import HomeEvents from './home/events';
import OrderEvents from './order/events';
import MiscEvents from './misc/events';
import DowntimeEvents from './downtime/events';
import { getTrackMethods, addAnalyticsMethods } from './helpers';
import MetaProperties from './metaProperties';
import Analytics, { Track } from './analytics';

let Events = getTrackMethods();
Events = addAnalyticsMethods(Events);

export default Analytics;

export {
  Events,
  CardEvents,
  DowntimeEvents,
  MiscEvents,
  OfferEvents,
  MetaProperties,
  P13NEvents,
  HomeEvents,
  OrderEvents,
  Track,
};
