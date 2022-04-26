declare namespace Downtime {
  export interface Config {
    severe: 'low' | 'high' | 'medium' | '';
    downtimeInstrument: string;
  }
}
