declare namespace Common {
  type Object<T = any> = {
    [key: string]: T;
  };
  type KeyObject<T extends string, V> = {
    [key in T]: V;
  };

  type JSFunction<
    ReturnType = any,
    DataType = any,
    DataRequired = 0
  > = DataRequired extends 1
    ? (data: DataType) => ReturnType
    : (data: DataType) => ReturnType;

  export interface Metadata {
    payment_id: string;
  }

  export interface Error {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: Metadata;
    action: string;
  }

  export interface ErrorResponse {
    error: Error;
  }
}
