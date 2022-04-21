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
}
