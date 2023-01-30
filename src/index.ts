/**
 * @since 1.0.0
 */
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
 * @since 1.0.0
 */
export type Matcher<Input, Remaining, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Remaining, RemainingApplied, Result>
  | ValueMatcher<Input, Remaining, RemainingApplied, Result, Provided>

class TypeMatcher<Input, Remaining, RemainingApplied, Result> {
  readonly _tag = "TypeMatcher"
  readonly _input: (_: Input) => unknown = identity
  readonly _remaining: (_: never) => Remaining = identity
  readonly _remainingApplied: (_: never) => RemainingApplied = identity
  readonly _result: (_: never) => Result = identity

  constructor(readonly cases: ReadonlyArray<Case>) {}

  add<I, R, RA, A>(_case: Case): TypeMatcher<I, R, RA, A> {
    return new TypeMatcher([...this.cases, _case])
  }
}

class ValueMatcher<Input, Remaining, RemainingApplied, Result, Provided> {
  readonly _tag = "ValueMatcher"
  readonly _input: (_: Input) => unknown = identity
  readonly _remaining: (_: never) => Remaining = identity
  readonly _result: (_: never) => Result = identity

  constructor(
    readonly provided: Provided,
    readonly value: E.Either<RemainingApplied, Provided>,
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
 * @since 1.0.0
 */
export const type = <I>(): Matcher<I, I, I, never, never> => new TypeMatcher([])

/**
 * @category constructors
 * @since 1.0.0
 */
export const value = <I>(i: I): Matcher<I, I, I, never, I> =>
  new ValueMatcher(i, E.left(i))

/**
 * @category combinators
 * @since 1.0.0
 */
export const when: {
  <RA, P extends PatternBase<RA>, B>(
    pattern: Narrow<P>,
    f: (_: WhenMatch<RA, P>) => B,
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<R, SafeSchemaR<PredToSchema<P>>>,
    ApplyFilters<AddWithout<R, SafeSchemaR<PredToSchema<P>>>>,
    A | B,
    Pr
  >

  <P, SR, RA, B>(
    schema: SafeSchema<P, SR>,
    f: (_: WhenSchemaMatch<RA, P>) => B,
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>,
  ) => Matcher<I, AddWithout<R, P>, ApplyFilters<AddWithout<R, SR>>, A | B, Pr>
} = (pattern: any, f: (input: unknown) => any) => (self: any) =>
  self.add(new When(P.is(makeSchema(pattern)), f))

/**
 * @category combinators
 * @since 1.0.0
 */
export const tag: {
  <RA, P extends Tags<RA> & (string | number | symbol | object | {}), B>(
    pattern: P,
    f: (_: Extract<RA, { readonly _tag: P }>) => B,
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>,
  ) => Matcher<
    I,
    AddWithout<R, Extract<RA, { _tag: P }>>,
    ApplyFilters<AddWithout<R, Extract<RA, { _tag: P }>>>,
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
 * @since 1.0.0
 */
export const not: {
  <RA, P extends PatternBase<RA>, B>(
    pattern: Narrow<P>,
    f: (_: NotMatch<RA, P>) => B,
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>,
  ) => Matcher<
    I,
    AddOnly<R, SafeSchemaP<ResolvePred<P>>>,
    ApplyFilters<AddOnly<R, SafeSchemaP<ResolvePred<P>>>>,
    A | B,
    Pr
  >

  <P, SR, RA, B>(schema: SafeSchema<P, SR>, f: (_: Exclude<RA, SR>) => B): <
    I,
    R,
    A,
    Pr,
  >(
    self: Matcher<I, R, RA, A, Pr>,
  ) => Matcher<I, AddOnly<R, P>, ApplyFilters<AddOnly<R, P>>, A | B, Pr>
} =
  (pattern: any, f: (_: never) => any) =>
  (self: any): any =>
    self.add(new Not(P.is(makeSchema(pattern)), f as any))

export interface SafeSchema<A, R = A> {
  readonly _tag: "SafeSchema"
  readonly _A: A
  readonly _R: R
}

export namespace SafeSchema {
  export type Infer<
    S extends { readonly _tag: "SafeSchema"; readonly _A: any },
  > = Parameters<S["_A"]>[0]
}

/**
 * Use a schema as a predicate, marking it **unsafe**. Unsafe means it contains
 * refinements that could make the pattern not match.
 *
 * @category predicates
 * @since 1.0.0
 */
export const unsafe = <A>(schema: S.Schema<A>): SafeSchema<A, never> =>
  schema as any

/**
 * Use a schema as a predicate, marking it **safe**. Safe means **it does not**
 * contain refinements that could make the pattern not match.
 *
 * @category predicates
 * @since 1.0.0
 */
export const safe = <A, R = A>(schema: S.Schema<A>): SafeSchema<A, R> =>
  schema as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const is = flow(S.literal, safe)

/**
 * @category predicates
 * @since 1.0.0
 */
export const string = safe(S.string)

/**
 * @category predicates
 * @since 1.0.0
 */
export const number = safe(S.number)

/**
 * @category predicates
 * @since 1.0.0
 */
export const any: SafeSchema<unknown, any> = safe(S.any)

/**
 * @category predicates
 * @since 1.0.0
 */
export const boolean = safe(S.boolean)

/**
 * @category predicates
 * @since 1.0.0
 */
export const undefined = safe(S.undefined)

/**
 * @category predicates
 * @since 1.0.0
 */
const _null = safe(S.null)
export { _null as null }

/**
 * @category predicates
 * @since 1.0.0
 */
export const bigint = safe(S.bigint)

/**
 * @category predicates
 * @since 1.0.0
 */
export const date = safe(S.date)

/**
 * @category conversions
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
 * @since 1.0.0
 */
export const either: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
) => [Pr] extends [never] ? (input: I) => E.Either<RA, A> : E.Either<RA, A> = (<
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
 * @since 1.0.0
 */
export const option: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
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
 * @since 1.0.0
 */
export const exhaustive: <I, R, A, Pr>(
  self: Matcher<I, R, never, A, Pr>,
) => [Pr] extends [never] ? (u: I) => A : A = (<I, A>(
  self: Matcher<I, any, never, A, I>,
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
type WhenMatch<R, P> = Replace<
  TryExtract<R, SafeSchemaP<ResolvePred<P>>>,
  SafeSchemaP<ResolvePred<P>>
>
type WhenSchemaMatch<R, P> = Replace<TryExtract<R, P>, P>

type NotMatch<R, P> = Exclude<R, SafeSchemaR<PredToSchema<P>>>

// utilities
type PredicateA<A> = Predicate<A> | Refinement<A, any>

type Narrow<A> = NarrowRaw<A> | PredicateA<any> | SafeSchema<any>

type NarrowRaw<A> =
  | (A extends [] ? [] : never)
  | (A extends PredicateA<any> ? A : never)
  | {
      [K in keyof A]: A[K] extends SafeSchema<any> ? A[K] : NarrowRaw<A[K]>
    }
  | (A extends Narrowable ? A : never)

type Narrowable = string | number | bigint | boolean

type SafeSchemaP<A> = A extends SafeSchema<infer S, infer _>
  ? S
  : A extends Record<string, any>
  ? { [K in keyof A]: SafeSchemaP<A[K]> }
  : A

type SafeSchemaR<A> = A extends SafeSchema<infer _, infer R>
  ? R
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

type ExpandTuples<A> = A extends Array<infer I>
  ? Array<I> | A
  : A extends Record<string, any>
  ? { [K in keyof A]: ExpandTuples<A[K]> }
  : A

type PatternBase<A> = A extends Record<string, any>
  ? Partial<{
      [K in keyof A]: PatternBase<A[K]> | PredicateA<A[K]> | SafeSchema<any>
    }>
  : A | PredicateA<A> | SafeSchema<any>

type WithoutLiterals<A> = A extends string
  ? string
  : A extends number
  ? number
  : A extends bigint
  ? bigint
  : A extends boolean
  ? boolean
  : A extends Record<string, any>
  ? { [K in keyof A]: WithoutLiterals<A[K]> }
  : A

type ExtractWithoutLiterals<A, E> = A extends WithoutLiterals<E> ? A : never

type TryExtract<A, E> = Extract<A, ExpandTuples<E>> extends never
  ? ExtractWithoutLiterals<A, ExpandTuples<E>>
  : Extract<A, ExpandTuples<E>>

type Replace<A, B> = A extends Record<string | number, any>
  ? { [K in keyof A]: K extends keyof B ? Replace<A[K], B[K]> : A[K] }
  : B extends A
  ? B
  : A

interface Without<A, X> {
  readonly _tag: "Without"
  readonly _A: A
  readonly _X: X
}

interface Only<A, X> {
  readonly _tag: "Only"
  readonly _A: A
  readonly _X: X
}

type AddWithout<A, X> = A extends Without<infer P, infer WX>
  ? Without<P, X | WX>
  : A extends Only<infer P, infer OX>
  ? Only<P, Exclude<OX, X>>
  : Without<A, X>

type AddOnly<A, X> = A extends Without<infer P, infer WX>
  ? X extends WX
    ? never
    : Only<P, X>
  : A extends Only<infer P, infer OX>
  ? X extends OX
    ? Only<P, X>
    : never
  : Only<A, X>

type ApplyFilters<A> = A extends Only<any, infer X>
  ? X
  : A extends Without<infer P, infer X>
  ? Exclude<P, X>
  : A

type Tags<P> = P extends { _tag: infer X } ? X : never
