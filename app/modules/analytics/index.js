import CardEvents from './card/events';
import OfferEvents from './offers/events';
import MiscEvents from './misc/events';
import { getTrackMethods, addAnalyticsMethods } from './helpers';
import MetaProperties from './metaProperties';
import Analytics, { Track } from './analytics';

let Events = getTrackMethods();
Events = addAnalyticsMethods(Events);

export default Analytics;

export {
  CardEvents,
  OfferEvents,
  MiscEvents,
  Events,
  MetaProperties,
  Track
};
