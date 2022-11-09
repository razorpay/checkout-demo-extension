import type { Instrument } from 'analytics-v2/types';

export type OtherAppsLoadEvent = {
  trigger_source: string;
  instrument?: Instrument[];
};
