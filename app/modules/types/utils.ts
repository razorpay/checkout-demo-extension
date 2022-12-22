/** flatten the object
 * base function pick from https://stackoverflow.com/a/69111325/1303585
 * modification done to support our use
 */

type Join<K, P, O = {}> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '-' : '.'}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export type Paths<T, D extends number = 6> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ?
            | `${K}`
            | (Join<
                K,
                Paths<T[K], Prev[D]>,
                T[K]
              > extends `${infer U}-${infer R}`
                ? R extends ''
                  ? U
                  : `${U}.${R}`
                : Join<K, Paths<T[K], Prev[D]>, T[K]>)
        : never;
    }[keyof T]
  : '';

export type FollowPath<T, P> = P extends `${infer U}.${infer R}`
  ? U extends keyof T
    ? FollowPath<T[U], R>
    : never
  : P extends keyof T
  ? T[P]
  : unknown;

export type ValueOf<T> = T[keyof T];

/**
 * Make particular property required and rest are optional
 */
export type MakeRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
