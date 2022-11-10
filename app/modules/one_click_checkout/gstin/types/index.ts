export type fieldValue = {
  id: string;
  value: string;
  pattern: string;
};

export type fieldErr = Record<string, string | undefined>;

export type handleInputType = (
  id: string,
  value: string,
  pattern: string
) => void;
export type handleBlurType = (id: string) => void;
export type errorType = string | undefined;
export type valueType = string | undefined | null;

export type validateGSTINParams = {
  id: string;
  isFieldValueValid: boolean;
};

export type UpdateOrderApiPayload = {
  gstin?: string;
  order_instructions?: string;
};

export type addGSTINParams = {
  gstIn?: string;
  orderInstruction?: string;
};

export type UpdateOrderNotes = {
  gstIn?: string;
  orderInstruction?: string;
};
