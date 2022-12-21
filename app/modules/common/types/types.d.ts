export type TransformParam = {
  amount: number;
  emi: boolean;
  recurring: boolean;
};

export type CardType = 'card';

export type WebPaymentsType = {
  [key: string]: boolean;
};
