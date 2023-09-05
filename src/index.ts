/**
 * @since 1.0.0
 */
import type * as E from "@effect/data/Either"
import type * as O from "@effect/data/Option"
import type { Pipeable } from "@effect/data/Pipeable"
import * as Predicate from "@effect/data/Predicate"
import type { Unify } from "@effect/data/Unify"
import * as internal from "@effect/match/internal/matcher"
import type { SafeRefinement } from "@effect/match/SafeRefinement"
import type * as Types from "@effect/match/Types"

/**
 * @category type ids
 * @since 1.0.0
 */
export const MatcherTypeId: unique symbol = internal.TypeId

/**
 * @category type ids
 * @since 1.0.0
 */
export type MatcherTypeId = typeof MatcherTypeId

/**
 * @category model
 * @since 1.0.0
 */
export type Matcher<Input, Filters, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided>

/**
 * @category model
 * @since 1.0.0
 */
export interface TypeMatcher<Input, Filters, Remaining, Result>
  extends Pipeable
{
  readonly _tag: "TypeMatcher"
  readonly [MatcherTypeId]: {
    readonly _input: (_: Input) => unknown
    readonly _filters: (_: never) => Filters
    readonly _remaining: (_: never) => Remaining
    readonly _result: (_: never) => Result
  }
  readonly cases: ReadonlyArray<Case>
  readonly add: <I, R, RA, A>(_case: Case) => TypeMatcher<I, R, RA, A>
}

/**
 * @category model
 * @since 1.0.0
 */
export interface ValueMatcher<Input, Filters, Remaining, Result, Provided>
  extends Pipeable
{
  readonly _tag: "ValueMatcher"
  readonly [MatcherTypeId]: {
    readonly _input: (_: Input) => unknown
    readonly _filters: (_: never) => Filters
    readonly _result: (_: never) => Result
  }
  readonly provided: Provided
  readonly value: E.Either<Remaining, Provided>
  readonly add: <I, R, RA, A, Pr>(_case: Case) => ValueMatcher<I, R, RA, A, Pr>
}

/**
 * @category model
 * @since 1.0.0
 */
export type Case = When | Not

/**
 * @category model
 * @since 1.0.0
 */
export interface When {
  readonly _tag: "When"
  readonly guard: (u: unknown) => boolean
  readonly evaluate: (input: unknown) => any
}

/**
 * @category model
 * @since 1.0.0
 */
export interface Not {
  readonly _tag: "Not"
  readonly guard: (u: unknown) => boolean
  readonly evaluate: (input: unknown) => any
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const type: <I>() => Matcher<I, Types.Without<never>, I, never, never> =
  internal.type

/**
 * @category constructors
 * @since 1.0.0
 */
export const value: <const I>(
  i: I,
) => Matcher<I, Types.Without<never>, I, never, I> = internal.value

/**
 * @category constructors
 * @since 1.0.0
 */
export const valueTags: <
  const I,
  P extends {
    readonly [Tag in Types.Tags<"_tag", I> & string]: (
      _: Extract<I, { readonly _tag: Tag }>,
    ) => any
  },
>(fields: P) => (input: I) => Unify<ReturnType<P[keyof P]>> = internal.valueTags

/**
 * @category constructors
 * @since 1.0.0
 */
export const typeTags: <I>() => <
  P extends {
    readonly [Tag in Types.Tags<"_tag", I> & string]: (
      _: Extract<I, { readonly _tag: Tag }>,
    ) => any
  },
>(fields: P) => (input: I) => Unify<ReturnType<P[keyof P]>> = internal.typeTags

/**
 * @category combinators
 * @since 1.0.0
 */
export const when: <
  R,
  const P extends Types.PatternPrimitive<R> | Types.PatternBase<R>,
  Fn extends (_: Types.WhenMatch<R, P>) => unknown,
>(
  pattern: P,
  f: Fn,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<P>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Types.PForExclude<P>>>,
  A | ReturnType<Fn>,
  Pr
> = internal.when as any

/**
 * @category combinators
 * @since 1.0.0
 */
export const whenOr: <
  R,
  const P extends ReadonlyArray<
    Types.PatternPrimitive<R> | Types.PatternBase<R>
  >,
  Fn extends (_: Types.WhenMatch<R, P[number]>) => unknown,
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<P[number]>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Types.PForExclude<P[number]>>>,
  A | ReturnType<Fn>,
  Pr
> = internal.whenOr as any

/**
 * @category combinators
 * @since 1.0.0
 */
export const whenAnd: <
  R,
  const P extends ReadonlyArray<
    Types.PatternPrimitive<R> | Types.PatternBase<R>
  >,
  Fn extends (_: Types.WhenMatch<R, Types.ArrayToIntersection<P>>) => unknown,
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<Types.ArrayToIntersection<P>>>,
  Types.ApplyFilters<
    I,
    Types.AddWithout<F, Types.PForExclude<Types.ArrayToIntersection<P>>>
  >,
  A | ReturnType<Fn>,
  Pr
> = internal.whenAnd as any

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminator: <D extends string>(
  field: D,
) => <R, P extends Types.Tags<D, R> & string, B>(
  ...pattern: [
    first: P,
    ...values: Array<P>,
    f: (_: Extract<R, Record<D, P>>) => B,
  ]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<D, P>>>>,
  B | A,
  Pr
> = internal.discriminator

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminatorStartsWith: <D extends string>(
  field: D,
) => <R, P extends string, B>(
  pattern: P,
  f: (_: Extract<R, Record<D, `${P}${string}`>>) => B,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, `${P}${string}`>>>,
  Types.ApplyFilters<
    I,
    Types.AddWithout<F, Extract<R, Record<D, `${P}${string}`>>>
  >,
  B | A,
  Pr
> = internal.discriminatorStartsWith as any

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminators: <D extends string>(
  field: D,
) => <
  R,
  P extends {
    readonly [Tag in Types.Tags<D, R> & string]?:
      | ((_: Extract<R, Record<D, Tag>>) => any)
      | undefined
  },
>(
  fields: P,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, keyof P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<D, keyof P>>>>,
  A | ReturnType<P[keyof P] & {}>,
  Pr
> = internal.discriminators

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminatorsExhaustive: <D extends string>(
  field: D,
) => <
  R,
  P extends {
    readonly [Tag in Types.Tags<D, R> & string]: (
      _: Extract<R, Record<D, Tag>>,
    ) => any
  },
>(
  fields: P,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (u: I) => Unify<A | ReturnType<P[keyof P]>>
  : Unify<A | ReturnType<P[keyof P]>> = internal.discriminatorsExhaustive

/**
 * @category combinators
 * @since 1.0.0
 */
export const tag: <R, P extends Types.Tags<"_tag", R> & string, B>(
  ...pattern: [
    first: P,
    ...values: Array<P>,
    f: (_: Extract<R, Record<"_tag", P>>) => B,
  ]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<"_tag", P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<"_tag", P>>>>,
  B | A,
  Pr
> = internal.tag

/**
 * @category combinators
 * @since 1.0.0
 */
export const tagStartsWith: <R, P extends string, B>(
  pattern: P,
  f: (_: Extract<R, Record<"_tag", `${P}${string}`>>) => B,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<"_tag", `${P}${string}`>>>,
  Types.ApplyFilters<
    I,
    Types.AddWithout<F, Extract<R, Record<"_tag", `${P}${string}`>>>
  >,
  B | A,
  Pr
> = internal.tagStartsWith as any

/**
 * @category combinators
 * @since 1.0.0
 */
export const tags: <
  R,
  P extends {
    readonly [Tag in Types.Tags<"_tag", R> & string]?:
      | ((_: Extract<R, Record<"_tag", Tag>>) => any)
      | undefined
  },
>(
  fields: P,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<"_tag", keyof P>>>,
  Types.ApplyFilters<
    I,
    Types.AddWithout<F, Extract<R, Record<"_tag", keyof P>>>
  >,
  A | ReturnType<P[keyof P] & {}>,
  Pr
> = internal.tags

/**
 * @category combinators
 * @since 1.0.0
 */
export const tagsExhaustive: <
  R,
  P extends {
    readonly [Tag in Types.Tags<"_tag", R> & string]: (
      _: Extract<R, Record<"_tag", Tag>>,
    ) => any
  },
>(
  fields: P,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (u: I) => Unify<A | ReturnType<P[keyof P]>>
  : Unify<A | ReturnType<P[keyof P]>> = internal.tagsExhaustive

/**
 * @category combinators
 * @since 1.0.0
 */
export const not: <
  R,
  const P extends Types.PatternPrimitive<R> | Types.PatternBase<R>,
  Fn extends (_: Types.NotMatch<R, P>) => unknown,
>(
  pattern: P,
  f: Fn,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => Matcher<
  I,
  Types.AddOnly<F, Types.WhenMatch<R, P>>,
  Types.ApplyFilters<I, Types.AddOnly<F, Types.WhenMatch<R, P>>>,
  A | ReturnType<Fn>,
  Pr
> = internal.not as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const nonEmptyString: SafeRefinement<string, never> =
  internal.nonEmptyString

/**
 * @category predicates
 * @since 1.0.0
 */
export const is: <
  Literals extends ReadonlyArray<string | number | bigint | boolean | null>,
>(...literals: Literals) => Predicate.Refinement<unknown, Literals[number]> =
  internal.is

/**
 * @category predicates
 * @since 1.0.0
 */
export const string: Predicate.Refinement<unknown, string> = Predicate.isString

/**
 * @category predicates
 * @since 1.0.0
 */
export const number: Predicate.Refinement<unknown, number> = Predicate.isNumber

/**
 * @category predicates
 * @since 1.0.0
 */
export const any: SafeRefinement<unknown, any> = internal.any

/**
 * @category predicates
 * @since 1.0.0
 */
export const defined: <A>(u: A) => u is A & {} = internal.defined

/**
 * @category predicates
 * @since 1.0.0
 */
export const boolean: Predicate.Refinement<unknown, boolean> =
  Predicate.isBoolean

const _undefined: Predicate.Refinement<unknown, undefined> =
  Predicate.isUndefined
export {
  /**
   * @category predicates
   * @since 1.0.0
   */
  _undefined as undefined,
}

const _null: Predicate.Refinement<unknown, null> = Predicate.isNull
export {
  /**
   * @category predicates
   * @since 1.0.0
   */
  _null as null,
}

/**
 * @category predicates
 * @since 1.0.0
 */
export const bigint: Predicate.Refinement<unknown, bigint> = Predicate.isBigint

/**
 * @category predicates
 * @since 1.0.0
 */
export const date: Predicate.Refinement<unknown, Date> = Predicate.isDate

/**
 * @category predicates
 * @since 1.0.0
 */
export const record: Predicate.Refinement<
  unknown,
  {
    [k: string]: any
    [k: symbol]: any
  }
> = Predicate.isRecord

/**
 * @category predicates
 * @since 1.0.0
 */
export const instanceOf: <A extends abstract new(...args: any) => any>(
  constructor: A,
) => SafeRefinement<InstanceType<A>, never> = internal.instanceOf

/**
 * @category predicates
 * @since 1.0.0
 */
export const instanceOfUnsafe: <A extends abstract new(...args: any) => any>(
  constructor: A,
) => SafeRefinement<InstanceType<A>, InstanceType<A>> = internal.instanceOf

/**
 * @category conversions
 * @since 1.0.0
 */
export const orElse: <RA, B>(
  f: (b: RA) => B,
) => <I, R, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
) => [Pr] extends [never] ? (input: I) => Unify<B | A> : Unify<B | A> =
  internal.orElse

/**
 * @category conversions
 * @since 1.0.0
 */
export const orElseAbsurd: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
) => [Pr] extends [never] ? (input: I) => Unify<A> : Unify<A> =
  internal.orElseAbsurd

/**
 * @category conversions
 * @since 1.0.0
 */
export const either: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => E.Either<R, Unify<A>>
  : E.Either<R, Unify<A>> = internal.either

/**
 * @category conversions
 * @since 1.0.0
 */
export const option: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => O.Option<Unify<A>>
  : O.Option<Unify<A>> = internal.option

/**
 * @category conversions
 * @since 1.0.0
 */
export const exhaustive: <I, F, A, Pr>(
  self: Matcher<I, F, never, A, Pr>,
) => [Pr] extends [never] ? (u: I) => Unify<A> : Unify<A> = internal.exhaustive
