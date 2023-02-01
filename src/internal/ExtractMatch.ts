/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */

export type ExtractMatch<I, P> = ReplaceUnions<I, P> extends infer EI
  ? Extract<EI, P> extends infer E
    ? [E] extends [never]
      ? EI
      : E
    : never
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

const Fail = Symbol.for("ReplaceUnions/Fail")
type Fail = typeof Fail

type Replace<A, B> = A extends Record<string | number, any>
  ? { [K in keyof A]: K extends keyof B ? Replace<A[K], B[K]> : A[K] }
  : {
      0: A
      1: B
    }[B extends A ? 1 : 0]

type MaybeReplace<I, P> = P extends I ? P : I extends P ? Replace<I, P> : Fail

type FlattenRecordFails<R, D = Fail> = Fail extends R[keyof R] ? D : R
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
        ? FlattenUnionFails<{ [K in keyof L]: ReplaceUnions<L[K], P> }[number]>
        : never
      : never
    : IsPlainObject<I> extends true
    ? FlattenRecordFails<{
        [RK in keyof I]: RK extends keyof P
          ? ReplaceUnions<I[RK], P[RK]>
          : I[RK]
      }>
    : MaybeReplace<I, P>

// type Equals<A, B> = A extends B ? (B extends A ? true : false) : false

// type MaybeExclude<I, P> = Equals<I, P> extends true
//   ? Fail
//   : IsUnion<P> extends true
//   ? I extends P
//     ? Fail
//     : I
//   : Exclude<I, P> extends infer E
//   ? [E] extends [never]
//     ? Fail
//     : I
//   : never

// type ReplaceUnionsExclude<I, P> =
//   // unknown is a wildcard pattern
//   unknown extends P
//     ? Fail
//     : IsUnion<I> extends true
//     ? ListOf<I> extends infer L
//       ? L extends Array<any>
//         ? {
//             [K in keyof L]: L[K] extends Record<string, any>
//               ? {
//                   [RK in keyof L[K]]: RK extends keyof P
//                     ? ReplaceUnionsExclude<L[K][RK], P[RK]>
//                     : L[K][RK]
//                 }
//               : MaybeExclude<L[K], P>
//           }[number]
//         : never
//       : never
//     : MaybeExclude<I, P>

// type I = { _tag: "A"; a: number | string } | { _tag: "B"; b: number }
// type P = { _tag: string; a: number }
// type a = ReplaceUnions<I, P>
