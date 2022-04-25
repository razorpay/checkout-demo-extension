declare namespace EMIPlanView {
  export type EMIPlanDurationData = {
    duration: number;
    interest: number;
    merchant_payback: string;
    min_amount: number;
    subvention: string;
  };

  export type EMIPlan = {
    code: string;
    name: string;
    plans?: {
      [x: number]: EMIPlanData;
    };
    min_amount?: number;
  };

  export type EMIPlanData = {
    [x: string]: EMIPlan;
  };
}
