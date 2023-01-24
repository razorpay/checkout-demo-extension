import type { Block, Instrument, Method } from 'analytics-v2/types';

export class AnalyticsV2State {
  // selected block from L0 screen
  static selectedBlock: Block = {};

  // selected instrument after submit for payment
  static selectedInstrumentForPayment: {
    method: Method;
    instrument: Instrument;
  } = { method: {}, instrument: {} };

  // time at which checkout was invoked
  static checkoutInvokedTime: number = Date.now();

  static personalisationVersionId = '';

  // used to store card flow value like savedcardL0, savedcardL1, and addnewcard.
  static cardFlow = '';
}
