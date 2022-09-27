import { ERROR } from 'analytics-types';
import { createTrackMethodForModule } from 'analytics-v2';

export const ErrorEvents = {
  TRIGGERED: { name: 'triggered', type: ERROR },
};

interface ErrorEventMap {
  TRIGGERED: {
    error: {
      name?: string;
      message?: string;
      lineNumber?: number;
      fileName?: string;
      columnNumber?: number;
      stack?: string;
      tags?: {
        severity: string;
        unhandled: boolean;
      };
    };
    last: {
      [key: string]: {
        event: string;
        properties: unknown;
      };
    };
  };
}

export const ErrorTracker =
  createTrackMethodForModule<ErrorEventMap>(ErrorEvents);
