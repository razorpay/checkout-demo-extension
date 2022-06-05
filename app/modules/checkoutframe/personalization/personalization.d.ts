import type { Method } from 'types/types';

declare namespace Personalization {
  /**
   * Refers to the common personalization object that is constructed post processing
   */
  interface Instrument {
    method: Method;
    score?: number;
    '_[flow]'?: string;
    upi_app?: string;
    bank?: string;
    vpa?: string;
    token_id?: string;
  }
  /**
   * Refers to the personalization object that we receive from the API
   */
  interface V2_Instrument_Raw {
    method: Method;
    instrument: string;
  }

  /**
   * Refers to the personalization object that we receive from local storage
   */
  interface V1_Instrument_Raw {
    id: string;
    frequency: number;
    method: Method;
    success: boolean;
    timestamp: number;
    bank?: string;
    token_id?: string;
    upi_app?: string;
    vpa?: string;
    vendor_vpa?: string;
    '_[flow]'?: string;
  }
}
