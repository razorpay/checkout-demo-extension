import type * as TYPES from 'analytics-types';

/** helper types */
export type GetEventNameType<
  T extends Record<string, string>,
  P extends string
> = Extract<keyof T, '__PREFIX'> extends never
  ? {
      [K in Exclude<keyof T, '__PREFIX'>]: `${P}:${T[K]}`;
    }
  : {
      [x in Uppercase<P>]: P;
    } & {
      [K in Exclude<keyof T, '__PREFIX'>]: `${P}:${T[K]}`;
    };

export type GenerateTrackProp<T extends object = typeof TYPES> = {
  [K in keyof T as K extends string
    ? `Track${Capitalize<Lowercase<K>>}`
    : never]: (eventName: string, data?: Record<string, unknown>) => void;
} & {
  Track: (eventName: string, data?: Record<string, unknown>) => void;
};

/** end of helper types */

/** track-error types */
export type NetworkErrorDetails = {
  method: string;
  url: string;
  baseUrl: string;
  status: string;
  xhrErrored: boolean;
  response: Record<string, any>;
};

export type NetworkError = {
  detail: NetworkErrorDetails;
};

export type Error = {
  name: string;
  message: string;
  stack?: string;
};

export type RzpError = {
  detail: Error;
};
/** end of track-error types */
