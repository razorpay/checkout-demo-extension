import { Events } from 'analytics';

export const FEE_BEARER_SHOWN = 'FEE_BEARER_SHOWN';
export const FEE_BEARER_CALCULATE_FEE_SUCCESS =
  'FEE_BEARER_CALCULATE_FEE_SUCCESS';
export const FEE_BEARER_CALCULATE_FEE_ERROR = 'FEE_BEARER_CALCULATE_FEE_ERROR';
export const FEE_BEARER_CONTINUE_CLICKED = 'FEE_BEARER_CONTINUE_CLICKED';

const Track = (Events as { Track: (eventName: string, data?: unknown) => void })
  .Track;

export const trackShown = () => {
  Track(FEE_BEARER_SHOWN);
};

export const trackFeeSuccess = (properties: Record<string, unknown>) => {
  Track(FEE_BEARER_CALCULATE_FEE_SUCCESS, properties);
};

export const trackFeeError = (properties: Record<string, unknown>) => {
  Track(FEE_BEARER_CALCULATE_FEE_ERROR, properties);
};

export const trackContinueClick = () => {
  Track(FEE_BEARER_CONTINUE_CLICKED);
};
