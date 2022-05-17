declare namespace CFU {
  /**
   * CFU Fetch
   */
  export type Fetch = {
    prototype: {
      abort: () => void;
      call: (callback: Function) => void;
      constructor: Window.fetch;
      defer: () => void;
      setReq: (type: string, value: any) => void;
      till: (
        continueUntilFn: Function,
        retryLimit: number,
        frequency?: number
      ) => void;
    };
    post: (options: any) => this;
    patch: (options: any) => this;
    setSessionId: (id: string) => void;
    setTrackId: (id: string) => void;
    setKeylessHeader: (id: string) => void;
    jsonp: (options: any) => this;
    pausePoll: Function;
    resumePoll: Function;
    setPollDelayBy: (xTimes?: number) => void;
  };
}
