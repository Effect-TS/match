/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */

export type ExtractMatch<I, P> = [ReplaceUnions<I, P>] extends [infer EI]
  ? Extract<EI, P>
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

type FlattenRecordFails<R, D = Fail> = Extract<
  R[Extract<keyof R, string>],
  Fail
> extends never
  ? R
  : D
type FlattenUnionFails<U> = [U] extends [Fail] ? Fail : Exclude<U, Fail>

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

type ReplaceUnions<I, P> =
  // unknown is a wildcard pattern
  unknown extends P
    ? I
    : IsUnion<I> extends true
    ? ListOf<I> extends infer L
      ? L extends Array<any>
        ? FlattenUnionFails<
            {
              [K in keyof L]: L[K] extends Array<I>
                ? L[K]
                : ReplaceUnions<L[K], P>
            }[number]
          >
        : never
      : never
    : IsPlainObject<I> extends true
    ? FlattenRecordFails<{
        [RK in keyof I]-?: RK extends keyof P
          ? ReplaceUnions<I[RK], P[RK]>
          : I[RK]
      }>
    : MaybeReplace<I, P>
