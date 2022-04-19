import * as helpers from 'analytics/helpers';
import type { CustomObject } from 'types';

export const getEventsName = <T extends CustomObject<string>>(
  prefix: string,
  events: T
): T => helpers.getEventsName(prefix, events) as T;
