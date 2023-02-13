/**
 * @since 1.0.0
 */
import type { ExtractMatch } from "@effect/match/internal/ExtractMatch"
import * as E from "@fp-ts/core/Either"
import { flow, identity } from "@fp-ts/core/Function"
import * as O from "@fp-ts/core/Option"
import type { Predicate, Refinement } from "@fp-ts/core/Predicate"
import * as RA from "@fp-ts/core/ReadonlyArray"
import type * as AST from "@fp-ts/schema/AST"
import * as P from "@fp-ts/schema/Parser"
import * as S from "@fp-ts/schema/Schema"

/**
 * @category model
 * @tsplus type effect/match/Matcher
 * @tsplus companion effect/match/Matcher.Ops
 * @since 1.0.0
 */
export type Matcher<Input, Filters, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided>

class TypeMatcher<Input, Filters, Remaining, Result> {
  readonly _tag = "TypeMatcher"
  readonly _input: (_: Input) => unknown = identity
  readonly _filters: (_: never) => Filters = identity
  readonly _remaining: (_: never) => Remaining = identity
  readonly _result: (_: never) => Result = identity

  constructor(readonly cases: ReadonlyArray<Case>) {}

  add<I, R, RA, A>(_case: Case): TypeMatcher<I, R, RA, A> {
    return new TypeMatcher([...this.cases, _case])
  }
}

class ValueMatcher<Input, Filters, Remaining, Result, Provided> {
  readonly _tag = "ValueMatcher"
  readonly _input: (_: Input) => unknown = identity
  readonly _filters: (_: never) => Filters = identity
  readonly _result: (_: never) => Result = identity

  constructor(
    readonly provided: Provided,
    readonly value: E.Either<Remaining, Provided>,
  ) {}

  add<I, R, RA, A, Pr>(_case: Case): ValueMatcher<I, R, RA, A, Pr> {
    if (this.value._tag === "Right") {
      // @ts-expect-error
      return this
    }

    if (
      _case._tag === "When" &&
      _case.guard(this.provided, { isUnexpectedAllowed: true })
    ) {
      return new ValueMatcher(
        this.provided,
        E.right(_case.evaluate(this.provided)),
      )
    } else if (
      _case._tag === "Not" &&
      !_case.guard(this.provided, { isUnexpectedAllowed: true })
    ) {
      return new ValueMatcher(
        this.provided,
        E.right(_case.evaluate(this.provided)),
      )
    }

    // @ts-expect-error
    return this
  }
}

type Case = When | Not

class When {
  readonly _tag = "When"
  constructor(
    readonly guard: (u: unknown, opts: AST.ParseOptions) => boolean,
    readonly evaluate: (input: unknown) => any,
  ) {}
}

class Not {
  readonly _tag = "Not"
  constructor(
    readonly guard: (u: unknown, opts: AST.ParseOptions) => boolean,
    readonly evaluate: (input: unknown) => any,
  ) {}
}

const makeSchema = <I>(
  pattern: I,
): I extends SafeSchema<any> ? I : SafeSchema<I> => {
  if (typeof pattern === "function") {
    return S.filter(pattern as any)(S.any) as any
  } else if (Array.isArray(pattern)) {
    return RA.isNonEmpty(pattern)
      ? S.tuple(...pattern.map(makeSchema))
      : (S.array(S.any) as any)
  } else if (pattern !== null && typeof pattern === "object") {
    if ("ast" in pattern) {
      return pattern as any
    }

    return S.struct(
      Object.fromEntries(
        Object.entries(pattern).map(([k, v]) => [k, makeSchema(v)]),
      ) as Record<string, S.Schema<any>>,
    ) as any
  }

  return S.literal(pattern as any) as any
}

/**
 * @category constructors
 * @tsplus static effect/match/Matcher.Ops type
 * @since 1.0.0
 */
export const type = <I>(): Matcher<I, Without<never>, I, never, never> =>
  new TypeMatcher([])

/**
 * @category constructors
 * @tsplus static effect/match/Matcher.Ops value
 * @tsplus static effect/match/Matcher.Ops __call
 * @since 1.0.0
 */
export const value = <I>(i: I): Matcher<I, Without<never>, I, never, I> =>
  new ValueMatcher(i, E.left(i))

/**
 * @category combinators
 * @tsplus pipeable effect/match/Matcher when
 * @since 1.0.0
 */
export const when: {
  <R, P extends PredicateA<R>, B>(pattern: P, f: (_: WhenMatch<R, P>) => B): <
    I,
    F,
    A,
    Pr,
  >(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<F, PForExclude<P>>,
    ApplyFilters<I, AddWithout<F, PForExclude<P>>>,
    A | B,
    Pr
  >

  <R, P extends PatternBase<R>, B>(
    pattern: Narrow<P>,
    f: (_: WhenMatch<R, P>) => B,
  ): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<F, PForExclude<P>>,
    ApplyFilters<I, AddWithout<F, PForExclude<P>>>,
    A | B,
    Pr
  >

  <P, SR, R, B>(
    schema: SafeSchema<P, SR>,
    f: (_: WhenSchemaMatch<R, P>) => B,
  ): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<F, WhenSchemaMatch<R, P>>,
    ApplyFilters<I, AddWithout<F, WhenSchemaMatch<R, P>>>,
    A | B,
    Pr
  >
} = (pattern: any, f: Function) => (self: any) =>
  self.add(new When(P.is(makeSchema(pattern)), f as any))

/**
 * @category combinators
 * @tsplus pipeable effect/match/Matcher tag
 * @since 1.0.0
 */
export const tag: {
  <R, P extends Tags<R> & (string | number | symbol | object | {}), B>(
    pattern: P,
    f: (_: Extract<R, { readonly _tag: P }>) => B,
  ): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<F, Extract<R, { _tag: P }>>,
    ApplyFilters<I, AddWithout<F, Extract<R, { _tag: P }>>>,
    A | B,
    Pr
  >
} = (pattern, f) => (self: any) =>
  self.add(
    new When(
      (_) =>
        typeof _ === "object" && _ != null && "_tag" in _ && _._tag === pattern,
      f as any,
    ),
  )

/**
 * @category combinators
 * @tsplus pipeable effect/match/Matcher not
 * @since 1.0.0
 */
export const not: {
  <R, P extends PredicateA<R>, B>(pattern: P, f: (_: NotMatch<R, P>) => B): <
    I,
    F,
    A,
    Pr,
  >(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddOnly<F, WhenMatch<R, P>>,
    ApplyFilters<I, AddOnly<F, WhenMatch<R, P>>>,
    A | B,
    Pr
  >

  <R, P extends PatternBase<R>, B>(
    pattern: Narrow<P>,
    f: (_: NotMatch<R, P>) => B,
  ): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddOnly<F, WhenMatch<R, P>>,
    ApplyFilters<I, AddOnly<F, WhenMatch<R, P>>>,
    A | B,
    Pr
  >

  <P, SR, R, B>(
    schema: SafeSchema<P, SR>,
    f: (_: Exclude<R, ExtractMatch<R, SR>>) => B,
  ): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ) => Matcher<
    I,
    AddOnly<F, ExtractMatch<R, P>>,
    ApplyFilters<I, AddOnly<F, ExtractMatch<R, P>>>,
    A | B,
    Pr
  >
} =
  (pattern: any, f: (_: never) => any) =>
  (self: any): any =>
    self.add(new Not(P.is(makeSchema(pattern)), f as any))

/**
 * @category model
 * @since 1.0.0
 */
export interface SafeSchema<A, R = A> {
  readonly _tag: "SafeSchema"
  readonly _A: A
  readonly _R: R
}

/**
 * @since 1.0.0
 */
export namespace SafeSchema {
  /**
   * @since 1.0.0
   */
  export type Infer<
    S extends { readonly _tag: "SafeSchema"; readonly _A: any },
  > = Parameters<S["_A"]>[0]
}

/**
 * Use a schema as a predicate, marking it **unsafe**. Unsafe means it contains
 * refinements that could make the pattern not match.
 *
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops unsafe
 * @since 1.0.0
 */
export const unsafe = <A>(schema: S.Schema<A>): SafeSchema<A, never> =>
  schema as any

/**
 * Use a schema as a predicate, marking it **safe**. Safe means **it does not**
 * contain refinements that could make the pattern not match.
 *
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops safe
 * @since 1.0.0
 */
export const safe = <A>(schema: S.Schema<A>): SafeSchema<A, A> => schema as any

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops is
 * @since 1.0.0
 */
export const is = flow(S.literal, safe)

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops string
 * @since 1.0.0
 */
export const string = safe(S.string)

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops number
 * @since 1.0.0
 */
export const number = safe(S.number)

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops any
 * @since 1.0.0
 */
export const any: SafeSchema<unknown, any> = safe(S.any)

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops boolean
 * @since 1.0.0
 */
export const boolean = safe(S.boolean)

/**
 * @tsplus static effect/match/Matcher.Ops undefined
 * @since 1.0.0
 */
export const _undefined = safe(S.undefined)
export {
  /**
   * @category predicates
   * @since 1.0.0
   */
  _undefined as undefined,
}

/**
 * @tsplus static effect/match/Matcher.Ops null
 * @since 1.0.0
 */
export const _null = safe(S.null)
export {
  /**
   * @category predicates
   * @since 1.0.0
   */
  _null as null,
}

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops bigint
 * @since 1.0.0
 */
export const bigint = safe(S.bigint)

/**
 * @category predicates
 * @tsplus static effect/match/Matcher.Ops date
 * @since 1.0.0
 */
export const date = safe(S.date)

/**
 * @category conversions
 * @tsplus pipeable effect/match/Matcher orElse
 * @since 1.0.0
 */
export const orElse =
  <RA, B>(f: (b: RA) => B) =>
  <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>,
  ): [Pr] extends [never] ? (input: I) => A | B : A | B => {
    const result = either(self)

    if (E.isEither(result)) {
      // @ts-expect-error
      return result._tag === "Right" ? result.right : f(result.left)
    }

    // @ts-expect-error
    return (input: I) => {
      const a = result(input)
      return a._tag === "Right" ? a.right : f(a.left)
    }
  }

/**
 * @category conversions
 * @tsplus getter effect/match/Matcher either
 * @since 1.0.0
 */
export const either: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => E.Either<R, A> : E.Either<R, A> = (<
  I,
  R,
  RA,
  A,
>(
  self: Matcher<I, R, RA, A, I>,
) => {
  if (self._tag === "ValueMatcher") {
    return self.value
  }

  return (input: I): E.Either<RA, A> => {
    for (const _case of self.cases) {
      if (
        _case._tag === "When" &&
        _case.guard(input, { isUnexpectedAllowed: true })
      ) {
        return E.right(_case.evaluate(input))
      } else if (
        _case._tag === "Not" &&
        !_case.guard(input, { isUnexpectedAllowed: true })
      ) {
        return E.right(_case.evaluate(input))
      }
    }

    return E.left(input as any)
  }
}) as any

/**
 * @category conversions
 * @tsplus getter effect/match/Matcher option
 * @since 1.0.0
 */
export const option: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => O.Option<A> : O.Option<A> = (<I, A>(
  self: Matcher<I, any, any, A, I>,
) => {
  const toEither = either(self)
  if (E.isEither(toEither)) {
    return O.fromEither(toEither)
  }
  return (input: I): O.Option<A> => O.fromEither((toEither as any)(input))
}) as any

/**
 * @category conversions
 * @tsplus getter effect/match/Matcher exhaustive
 * @since 1.0.0
 */
export const exhaustive: <I, F, A, Pr>(
  self: Matcher<I, F, never, A, Pr>,
) => [Pr] extends [never] ? (u: I) => A : A = (<I, F, A>(
  self: Matcher<I, F, never, A, I>,
) => {
  const toEither = either(self as any)

  if (E.isEither(toEither)) {
    if (toEither._tag === "Right") {
      return toEither.right
    }

    throw "absurd"
  }

  return (u: I): A => {
    // @ts-expect-error
    const result = toEither(u)

    if (result._tag === "Right") {
      return result.right as any
    }

    throw "absurd"
  }
}) as any

// type helpers

// combinations
type WhenMatch<R, P> = ExtractMatch<R, PForMatch<P>>
type WhenSchemaMatch<R, P> = ExtractMatch<R, P>

type NotMatch<R, P> = Exclude<R, ExtractMatch<R, PForExclude<P>>>

type PForMatch<P> = RemoveInvalidPatterns<SafeSchemaP<ResolvePred<P>>>
type PForExclude<P> = RemoveInvalidPatterns<SafeSchemaR<PredToSchema<P>>>

// utilities
type PredicateA<A> = Predicate<A> | Refinement<A, any>

type Narrow<A> = NarrowRaw<A> | PredicateA<any>

type NarrowRaw<A> =
  | (A extends [] ? [] : never)
  | (A extends PredicateA<infer _P> ? A : never)
  | {
      [K in keyof A]: A[K] extends PredicateA<infer _P>
        ? A[K]
        : A[K] extends SafeSchema<any>
        ? A[K]
        : NarrowRaw<A[K]>
    }
  | (A extends Narrowable ? A : never)

type Narrowable = string | number | bigint | boolean

type SafeSchemaP<A> = A extends SafeSchema<infer S, infer _>
  ? S
  : A extends Function
  ? A
  : A extends Record<string, any>
  ? { [K in keyof A]: SafeSchemaP<A[K]> }
  : A

type SafeSchemaR<A> = A extends SafeSchema<infer _, infer R>
  ? R
  : A extends Function
  ? A
  : A extends Record<string, any>
  ? { [K in keyof A]: SafeSchemaR<A[K]> }
  : A

type ResolvePred<A> = A extends Refinement<any, infer P>
  ? P
  : A extends Predicate<infer P>
  ? P
  : A extends SafeSchema<any>
  ? A
  : A extends Record<string, any>
  ? { [K in keyof A]: ResolvePred<A[K]> }
  : A

type PredToSchema<A> = A extends Refinement<any, infer P>
  ? SafeSchema<P, P>
  : A extends Predicate<infer P>
  ? SafeSchema<P, never>
  : A extends SafeSchema<any>
  ? A
  : A extends Record<string, any>
  ? { [K in keyof A]: PredToSchema<A[K]> }
  : A

type PatternBase<A> = A extends Record<string, any>
  ? Partial<{
      [K in keyof A]: PatternBase<A[K]> | PredicateA<A[K]> | SafeSchema<any>
    }>
  : A | PredicateA<A> | SafeSchema<any>

type RemoveInvalidPatterns<P> = ValidPattern<P> extends true ? P : never

type ValidPattern<P> = P extends SafeSchema<any>
  ? false
  : P extends Record<string, any>
  ? [
      { [K in keyof P]: ValidPattern<P[K]> } extends infer R
        ? Extract<R[keyof R], false>
        : never,
    ] extends [never]
    ? true
    : false
  : true

interface Without<X> {
  readonly _tag: "Without"
  readonly _X: X
}

interface Only<X> {
  readonly _tag: "Only"
  readonly _X: X
}

type AddWithout<A, X> = [A] extends [Without<infer WX>]
  ? Without<X | WX>
  : [A] extends [Only<infer OX>]
  ? Only<Exclude<OX, X>>
  : never

type AddOnly<A, X> = [A] extends [Without<infer WX>]
  ? [X] extends [WX]
    ? never
    : Only<X>
  : [A] extends [Only<infer OX>]
  ? [X] extends [OX]
    ? Only<X>
    : never
  : never

type ApplyFilters<I, A> = A extends Only<infer X>
  ? X
  : A extends Without<infer X>
  ? Exclude<I, X>
  : never

type Tags<P> = P extends { _tag: infer X } ? X : never
