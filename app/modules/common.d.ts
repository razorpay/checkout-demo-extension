declare namespace Common {
  type Object<T = any> = {
    [key: string]: T;
  };
  type KeyObject<T extends string, V> = {
    [key in T]: V;
  };

  const enum GooglePayWrapperVersion {
    ONE = '1',
    TWO = '2',
    BOTH = 'both',
  }

  type JSFunction<
    ReturnType = any,
    DataType = any,
    DataRequired = 0
  > = DataRequired extends 1
    ? (data: DataType) => ReturnType
    : (data: DataType) => ReturnType;
}
