/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */

export type ExtractMatch<I, P> = [ExtractAndNarrow<I, P>] extends [infer EI]
  ? EI
  : never

type IntersectOf<U extends unknown> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

type Last<U extends any> = IntersectOf<
  U extends unknown ? (x: U) => void : never
> extends (x: infer P) => void
  ? P
  : never

type _ListOf<U, LN extends Array<any> = [], LastU = Last<U>> = {
  0: _ListOf<Exclude<U, LastU>, [LastU, ...LN]>
  1: LN
}[[U] extends [never] ? 1 : 0]

type ListOf<U extends any> = _ListOf<U> extends infer X
  ? X extends Array<any>
    ? X
    : []
  : never

type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false
  ? false
  : true

const Fail = Symbol.for("@effect/match/Fail")
type Fail = typeof Fail

type Replace<A, B> = A extends Function
  ? A
  : A extends Record<string | number, any>
  ? { [K in keyof A]: K extends keyof B ? Replace<A[K], B[K]> : A[K] }
  : [B] extends [A]
  ? B
  : A

type MaybeReplace<I, P> = [P] extends [I]
  ? P
  : [I] extends [P]
  ? Replace<I, P>
  : Fail

type BuiltInObjects =
  | Function
  | Date
  | RegExp
  | Generator
  | { readonly [Symbol.toStringTag]: string }

type IsPlainObject<T> = T extends BuiltInObjects
  ? false
  : T extends Record<string, any>
  ? true
  : false

type Simplify<A> = { [K in keyof A]: A[K] } & {}

type ExtractAndNarrow<I, P> =
  // unknown is a wildcard pattern
  unknown extends P
    ? I
    : IsUnion<I> extends true
    ? ListOf<I> extends infer L
      ? L extends Array<any>
        ? Exclude<{ [K in keyof L]: ExtractAndNarrow<L[K], P> }[number], Fail>
        : never
      : never
    : I extends ReadonlyArray<any>
    ? P extends ReadonlyArray<any>
      ? {
          readonly [K in keyof I]: K extends keyof P
            ? ExtractAndNarrow<I[K], P[K]>
            : I[K]
        } extends infer R
        ? Fail extends R[keyof R]
          ? never
          : R
        : never
      : never
    : IsPlainObject<I> extends true
    ? string extends keyof I
      ? I extends P
        ? I
        : never
      : symbol extends keyof I
      ? I extends P
        ? I
        : never
      : Simplify<
          {
            [RK in Extract<keyof I, keyof P>]-?: ExtractAndNarrow<I[RK], P[RK]>
          } & Omit<I, keyof P>
        > extends infer R
      ? [keyof P] extends [keyof RemoveFails<R>]
        ? R
        : never
      : never
    : MaybeReplace<I, P> extends infer R
    ? [I] extends [R]
      ? I
      : R
    : never

type RemoveFails<A> = {
  [K in keyof A & {}]: A[K] extends Fail ? never : K
}[keyof A] extends infer K
  ? [K] extends [keyof A]
    ? { [RK in K]: A[RK] }
    : {}
  : {}
