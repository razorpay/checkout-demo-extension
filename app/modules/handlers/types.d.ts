type instrument = {
  instrument: string;
  method: string;
};
export type ErrorMetadata = {
  next: Array<{
    action: string;
    instruments: instrument[];
  }>;
  order_id?: string;
  payment_id?: string;
};
