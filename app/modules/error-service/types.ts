export type Error = {
  message?: string;
  name?: string;
  stack?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  code?: string;
  metadata?: string;
};

export type Tags = {
  severity: string;
  unhandled?: boolean;
  ignored?: boolean;
};

export type CustomError = Partial<Error> & {
  tags: Tags;
};

export type ErrorParam = Error | string | undefined;

export type TrackerTriggered = {
  error: Error;
  last: {
    [key: string]: {
      event: string;
      properties: unknown;
    };
  };
};

type Analytics = {
  event: string;
  data: Record<string, any>;
  immediately?: boolean;
};

export type CaptureErrorOptions = Partial<Tags> & {
  analytics?: Analytics;
};
