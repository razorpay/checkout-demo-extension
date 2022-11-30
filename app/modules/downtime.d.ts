declare namespace Downtime {
  export type Severe = 'low' | 'high' | 'medium' | '';

  export interface Config {
    severe: Severe;
    downtimeInstrument: string;
  }
  export interface RawDowntime {
    severity: Severe;
    scheduled: boolean;
    method: string;
    instrument?: {
      vpa_handle: string;
      psp: string;
      bank: string;
    };
  }
  export type DowntimeCheckerType = (
    downtime: RawDowntime,
    preferences?: {
      methods: {
        netbanking: Common.Object<string>;
        fpx: Common.Object<string>;
      };
    },
    methodDowntimes?: RawDowntime[],
    severity?: Severe
  ) => void;
}
