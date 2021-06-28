import CardEvents from './card/events';
import OfferEvents from './offers/events';
import { getTrackMethods, addAnalyticsMethods } from './helpers';
import MetaProperties from './metaProperties';
import Analytics from './analytics';

let Events = getTrackMethods();
Events = addAnalyticsMethods(Events);

export default Analytics;

export {
  CardEvents,
  OfferEvents,
  Events,
  MetaProperties
};
