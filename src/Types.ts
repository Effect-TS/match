/**
 * @since 1.0.0
 */
/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import type { Predicate, Refinement } from "@effect/data/Predicate"
import type { UnionToIntersection } from "@effect/data/Types"
import type { SafeRefinement } from "@effect/match/SafeRefinement"

/**
 * @since 1.0.0
 */
export type WhenMatch<R, P> =
  // check for any
  [0] extends [1 & R] ? PForMatch<P>
    : P extends SafeRefinement<infer SP, never> ? SP
    : P extends Refinement<infer _R, infer RP>
    // try to narrow refinement
      ? [Extract<R, RP>] extends [infer X] ? [X] extends [never]
          // fallback to original refinement
          ? RP
        : X
      : never
    : P extends PredicateA<infer PP> ? PP
    : ExtractMatch<R, PForMatch<P>>

/**
 * @since 1.0.0
 */
export type NotMatch<R, P> = Exclude<R, ExtractMatch<R, PForExclude<P>>>

/**
 * @since 1.0.0
 */
export type PForMatch<P> = [SafeRefinementP<ResolvePred<P>>] extends [infer X]
  ? X
  : never

/**
 * @since 1.0.0
 */
export type PForExclude<P> = [SafeRefinementR<ToSafeRefinement<P>>] extends
  [infer X] ? X
  : never

// utilities
type PredicateA<A> = Predicate<A> | Refinement<A, A>

type SafeRefinementP<A> = A extends never ? never
  : A extends SafeRefinement<infer S, infer _> ? S
  : A extends Function ? A
  : A extends Record<string, any>
    ? DrainOuterGeneric<{ [K in keyof A]: SafeRefinementP<A[K]> }>
  : A

type SafeRefinementR<A> = A extends never ? never
  : A extends SafeRefinement<infer _, infer R> ? R
  : A extends Function ? A
  : A extends Record<string, any>
    ? DrainOuterGeneric<{ [K in keyof A]: SafeRefinementR<A[K]> }>
  : A

type ResolvePred<A> = A extends never ? never
  : A extends Refinement<any, infer P> ? P
  : A extends Predicate<infer P> ? P
  : A extends SafeRefinement<any> ? A
  : A extends Record<string, any>
    ? DrainOuterGeneric<{ [K in keyof A]: ResolvePred<A[K]> }>
  : A

type ToSafeRefinement<A> = A extends never ? never
  : A extends Refinement<any, infer P> ? SafeRefinement<P, P>
  : A extends Predicate<infer P> ? SafeRefinement<P, never>
  : A extends SafeRefinement<any> ? A
  : A extends Record<string, any>
    ? DrainOuterGeneric<{ [K in keyof A]: ToSafeRefinement<A[K]> }>
  : NonLiteralsTo<A, never>

type NonLiteralsTo<A, T> = [A] extends [string | number | boolean | bigint]
  ? [string] extends [A] ? T
  : [number] extends [A] ? T
  : [boolean] extends [A] ? T
  : [bigint] extends [A] ? T
  : A
  : A

type DrainOuterGeneric<T> = [T] extends [unknown] ? T : never

/**
 * @since 1.0.0
 */
export type PatternBase<A> = A extends ReadonlyArray<infer _T>
  ? ReadonlyArray<any> | PatternPrimitive<A>
  : A extends Record<string, any> ? Partial<
      DrainOuterGeneric<
        { [K in keyof A]: PatternPrimitive<A[K] & {}> | PatternBase<A[K] & {}> }
      >
    >
  : never

/**
 * @since 1.0.0
 */
export type PatternPrimitive<A> = PredicateA<A> | A | SafeRefinement<any>

/**
 * @since 1.0.0
 */
export interface Without<X> {
  readonly _tag: "Without"
  readonly _X: X
}

/**
 * @since 1.0.0
 */
export interface Only<X> {
  readonly _tag: "Only"
  readonly _X: X
}

/**
 * @since 1.0.0
 */
export type AddWithout<A, X> = [A] extends [Without<infer WX>] ? Without<X | WX>
  : [A] extends [Only<infer OX>] ? Only<Exclude<OX, X>>
  : never

/**
 * @since 1.0.0
 */
export type AddOnly<A, X> = [A] extends [Without<infer WX>]
  ? [X] extends [WX] ? never
  : Only<X>
  : [A] extends [Only<infer OX>] ? [X] extends [OX] ? Only<X>
    : never
  : never

/**
 * @since 1.0.0
 */
export type ApplyFilters<I, A> = A extends Only<infer X> ? X
  : A extends Without<infer X> ? Exclude<I, X>
  : never

/**
 * @since 1.0.0
 */
export type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never

/**
 * @since 1.0.0
 */
export type ArrayToIntersection<A extends ReadonlyArray<any>> =
  UnionToIntersection<
    A[number]
  >

/**
 * @since 1.0.0
 */
export type ExtractMatch<I, P> = [ExtractAndNarrow<I, P>] extends [infer EI]
  ? EI
  : never

type IntersectOf<U extends unknown> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void ? I
  : never

type Last<U extends any> = IntersectOf<
  U extends unknown ? (x: U) => void : never
> extends (x: infer P) => void ? P
  : never

type _ListOf<U, LN extends Array<any> = [], LastU = Last<U>> = {
  0: _ListOf<Exclude<U, LastU>, [LastU, ...LN]>
  1: LN
}[[U] extends [never] ? 1 : 0]

type ListOf<U extends any> = _ListOf<U> extends infer X
  ? X extends Array<any> ? X
  : []
  : never

type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false ? false
  : true

const Fail = Symbol.for("@effect/match/Fail")
type Fail = typeof Fail

type Replace<A, B> = A extends Function ? A
  : A extends Record<string | number, any>
    ? { [K in keyof A]: K extends keyof B ? Replace<A[K], B[K]> : A[K] }
  : [B] extends [A] ? B
  : A

type MaybeReplace<I, P> = [P] extends [I] ? P
  : [I] extends [P] ? Replace<I, P>
  : Fail

type BuiltInObjects =
  | Function
  | Date
  | RegExp
  | Generator
  | { readonly [Symbol.toStringTag]: string }

type IsPlainObject<T> = T extends BuiltInObjects ? false
  : T extends Record<string, any> ? true
  : false

type Simplify<A> = { [K in keyof A]: A[K] } & {}

type ExtractAndNarrow<I, P> =
  // unknown is a wildcard pattern
  unknown extends P ? I
    : IsUnion<I> extends true
      ? ListOf<I> extends infer L ? L extends Array<any> ? Exclude<
            DrainOuterGeneric<
              { [K in keyof L]: ExtractAndNarrow<L[K], P> }
            >[number],
            Fail
          >
        : never
      : never
    : I extends ReadonlyArray<any>
      ? P extends ReadonlyArray<any> ? DrainOuterGeneric<
          {
            readonly [K in keyof I]: K extends keyof P
              ? ExtractAndNarrow<I[K], P[K]>
              : I[K]
          }
        > extends infer R ? Fail extends R[keyof R] ? never
          : R
        : never
      : never
    : IsPlainObject<I> extends true ? string extends keyof I ? I extends P ? I
        : never
      : symbol extends keyof I ? I extends P ? I
        : never
      : Simplify<
        DrainOuterGeneric<
          {
            [RK in Extract<keyof I, keyof P>]-?: ExtractAndNarrow<I[RK], P[RK]>
          }
        > & Omit<I, keyof P>
      > extends infer R ? [keyof P] extends [keyof RemoveFails<R>] ? R
        : never
      : never
    : MaybeReplace<I, P> extends infer R ? [I] extends [R] ? I
      : R
    : never

type RemoveFails<A> = {
  [K in keyof A & {}]: A[K] extends Fail ? never : K
}[keyof A] extends infer K ? [K] extends [keyof A] ? { [RK in K]: A[RK] }
  : {}
  : {}
