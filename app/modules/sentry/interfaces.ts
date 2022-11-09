export interface Context {
  options: object; // TODO: migrate to options interface post migration
  checkout_id: string;
  order_id: string;
  logged_in: boolean;
  one_click_checkout: boolean;
  has_saved_address: boolean;
  has_saved_cards: boolean;
}

export interface StackFrame {
  function: string;
  filename: string;
  in_app: boolean;
  lineno: number;
  colno: number;
}

export interface Exception {
  values: Array<ExceptionValue>;
}

export interface ExceptionValue {
  type: string;
  value: string;
  stacktrace: StackTrace;
  mechanism?: Mechanism;
}

export interface StackTrace {
  frames: Array<StackFrame>;
}

export interface Mechanism {
  type: string;
  handled: boolean;
  data: {
    function: string;
    handler: string;
    target: string;
  };
}
