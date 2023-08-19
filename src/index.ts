/**
 * @since 1.0.0
 */
import * as E from "@effect/data/Either"
import { identity } from "@effect/data/Function"
import * as O from "@effect/data/Option"
import type { Pipeable } from "@effect/data/Pipeable"
import { pipeArguments } from "@effect/data/Pipeable"
import type { Predicate, Refinement } from "@effect/data/Predicate"
import * as P from "@effect/data/Predicate"
import type { Unify } from "@effect/data/Unify"
import type { ExtractMatch } from "@effect/match/internal/ExtractMatch"

/**
 * @category model
 * @since 1.0.0
 */
export type Matcher<Input, Filters, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided>

interface TypeMatcher<Input, Filters, Remaining, Result> extends Pipeable {
  readonly _tag: "TypeMatcher"
  readonly _input: (_: Input) => unknown
  readonly _filters: (_: never) => Filters
  readonly _remaining: (_: never) => Remaining
  readonly _result: (_: never) => Result
  readonly cases: ReadonlyArray<Case>
  readonly add: <I, R, RA, A>(_case: Case) => TypeMatcher<I, R, RA, A>
}

class TypeMatcherImpl<Input, Filters, Remaining, Result>
  implements TypeMatcher<Input, Filters, Remaining, Result>
{
  readonly _tag = "TypeMatcher"
  readonly _input = identity
  readonly _filters = identity
  readonly _remaining = identity
  readonly _result = identity

  constructor(readonly cases: ReadonlyArray<Case>) {}

  add<I, R, RA, A>(_case: Case): TypeMatcher<I, R, RA, A> {
    return new TypeMatcherImpl([...this.cases, _case])
  }

  pipe() {
    return pipeArguments(this, arguments)
  }
}

interface ValueMatcher<Input, Filters, Remaining, Result, Provided>
  extends Pipeable
{
  readonly _tag: "ValueMatcher"
  readonly _input: (_: Input) => unknown
  readonly _filters: (_: never) => Filters
  readonly _result: (_: never) => Result
  readonly provided: Provided
  readonly value: E.Either<Remaining, Provided>
  readonly add: <I, R, RA, A, Pr>(_case: Case) => ValueMatcher<I, R, RA, A, Pr>
}

class ValueMatcherImpl<Input, Filters, Remaining, Result, Provided>
  implements ValueMatcher<Input, Filters, Remaining, Result, Provided>
{
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

    if (_case._tag === "When" && _case.guard(this.provided) === true) {
      return new ValueMatcherImpl(
        this.provided,
        E.right(_case.evaluate(this.provided)),
      )
    } else if (_case._tag === "Not" && _case.guard(this.provided) === false) {
      return new ValueMatcherImpl(
        this.provided,
        E.right(_case.evaluate(this.provided)),
      )
    }

    // @ts-expect-error
    return this
  }

  pipe() {
    return pipeArguments(this, arguments)
  }
}

type Case = When | Not

class When {
  readonly _tag = "When"
  constructor(
    readonly guard: (u: unknown) => boolean,
    readonly evaluate: (input: unknown) => any,
  ) {}
}

class Not {
  readonly _tag = "Not"
  constructor(
    readonly guard: (u: unknown) => boolean,
    readonly evaluate: (input: unknown) => any,
  ) {}
}

const makePredicate = (pattern: unknown): Predicate<unknown> => {
  if (typeof pattern === "function") {
    return pattern as Predicate<unknown>
  } else if (Array.isArray(pattern)) {
    const predicates = pattern.map(makePredicate)
    const len = predicates.length

    return (u: unknown) => {
      if (!Array.isArray(u)) {
        return false
      }

      for (let i = 0; i < len; i++) {
        if (predicates[i](u[i]) === false) {
          return false
        }
      }

      return true
    }
  } else if (pattern !== null && typeof pattern === "object") {
    const keysAndPredicates = Object.entries(pattern).map(
      ([k, p]) => [k, makePredicate(p)] as const,
    )
    const len = keysAndPredicates.length

    return (u: unknown) => {
      if (typeof u !== "object" || u === null) {
        return false
      }

      for (let i = 0; i < len; i++) {
        const [key, predicate] = keysAndPredicates[i]
        if (!(key in u) || predicate((u as any)[key]) === false) {
          return false
        }
      }

      return true
    }
  }

  return (u: unknown) => u === pattern
}

const makeOrPredicate = (
  patterns: ReadonlyArray<unknown>,
): Predicate<unknown> => {
  const predicates = patterns.map(makePredicate)
  const len = predicates.length

  return (u: unknown) => {
    for (let i = 0; i < len; i++) {
      if (predicates[i](u) === true) {
        return true
      }
    }

    return false
  }
}

const makeAndPredicate = (
  patterns: ReadonlyArray<unknown>,
): Predicate<unknown> => {
  const predicates = patterns.map(makePredicate)
  const len = predicates.length

  return (u: unknown) => {
    for (let i = 0; i < len; i++) {
      if (predicates[i](u) === false) {
        return false
      }
    }

    return true
  }
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const type = <I>(): Matcher<I, Without<never>, I, never, never> =>
  new TypeMatcherImpl([])

/**
 * @category constructors
 * @since 1.0.0
 */
export const value = <const I>(i: I): Matcher<I, Without<never>, I, never, I> =>
  new ValueMatcherImpl(i, E.left(i))

/**
 * @category constructors
 * @since 1.0.0
 */
export const valueTags = <
  const I,
  P extends {
    readonly [Tag in Tags<"_tag", I> & string]: (
      _: Extract<I, { readonly _tag: Tag }>,
    ) => any
  },
>(
  fields: P,
) => {
  const match: any = tagsExhaustive(fields)(new TypeMatcherImpl([]))
  return (input: I): Unify<ReturnType<P[keyof P]>> => match(input)
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const typeTags = <I>() =>
<
  P extends {
    readonly [Tag in Tags<"_tag", I> & string]: (
      _: Extract<I, { readonly _tag: Tag }>,
    ) => any
  },
>(
  fields: P,
) => {
  const match: any = tagsExhaustive(fields)(new TypeMatcherImpl([]))
  return (input: I): Unify<ReturnType<P[keyof P]>> => match(input)
}

/**
 * @category combinators
 * @since 1.0.0
 */
export const when = <
  R,
  const P extends PatternPrimitive<R> | PatternBase<R>,
  Fn extends (_: WhenMatch<R, P>) => unknown,
>(
  pattern: P,
  f: Fn,
) =>
<I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
): Matcher<
  I,
  AddWithout<F, PForExclude<P>>,
  ApplyFilters<I, AddWithout<F, PForExclude<P>>>,
  A | ReturnType<Fn>,
  Pr
> => (self as any).add(new When(makePredicate(pattern), f as any))

/**
 * @category combinators
 * @since 1.0.0
 */
export const whenOr = <
  R,
  const P extends ReadonlyArray<PatternPrimitive<R> | PatternBase<R>>,
  Fn extends (_: WhenMatch<R, P[number]>) => unknown,
>(
  ...args: [...patterns: P, f: Fn]
) =>
<I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
): Matcher<
  I,
  AddWithout<F, PForExclude<P[number]>>,
  ApplyFilters<I, AddWithout<F, PForExclude<P[number]>>>,
  A | ReturnType<Fn>,
  Pr
> => {
  const onMatch = args[args.length - 1] as any
  const patterns = args.slice(0, -1) as unknown as P
  return (self as any).add(new When(makeOrPredicate(patterns), onMatch))
}

/**
 * @category combinators
 * @since 1.0.0
 */
export const whenAnd = <
  R,
  const P extends ReadonlyArray<PatternPrimitive<R> | PatternBase<R>>,
  Fn extends (_: WhenMatch<R, ArrayToIntersection<P>>) => unknown,
>(
  ...args: [...patterns: P, f: Fn]
) =>
<I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
): Matcher<
  I,
  AddWithout<F, PForExclude<ArrayToIntersection<P>>>,
  ApplyFilters<I, AddWithout<F, PForExclude<ArrayToIntersection<P>>>>,
  A | ReturnType<Fn>,
  Pr
> => {
  const onMatch = args[args.length - 1] as any
  const patterns = args.slice(0, -1) as unknown as P
  return (self as any).add(new When(makeAndPredicate(patterns), onMatch))
}

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminator =
  <D extends string>(field: D) =>
  <R, P extends Tags<D, R> & string, B>(
    ...pattern: [
      first: P,
      ...values: Array<P>,
      f: (_: Extract<R, Record<D, P>>) => B,
    ]
  ) => {
    const f = pattern[pattern.length - 1]
    const values: Array<P> = pattern.slice(0, -1) as any
    const pred = values.length === 1
      ? (_: any) => _[field] === values[0]
      : (_: any) => values.includes(_[field])

    return <I, F, A, Pr>(
      self: Matcher<I, F, R, A, Pr>,
    ): Matcher<
      I,
      AddWithout<F, Extract<R, Record<D, P>>>,
      ApplyFilters<I, AddWithout<F, Extract<R, Record<D, P>>>>,
      A | B,
      Pr
    > => (self as any).add(new When(pred, f as any)) as any
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminators = <D extends string>(field: D) =>
<
  R,
  P extends {
    readonly [Tag in Tags<D, R> & string]?: (
      _: Extract<R, Record<D, Tag>>,
    ) => any
  },
>(
  fields: P,
) => {
  const predicates: Array<When> = []
  for (const key in fields) {
    const pred = (_: any) => _[field] === key
    const f = fields[key]
    if (f) {
      predicates.push(new When(pred, f as any))
    }
  }
  const len = predicates.length

  return <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>,
  ): Matcher<
    I,
    AddWithout<F, Extract<R, Record<D, keyof P>>>,
    ApplyFilters<I, AddWithout<F, Extract<R, Record<D, keyof P>>>>,
    A | ReturnType<P[keyof P] & {}>,
    Pr
  > => {
    let matcher: any = self
    for (let i = 0; i < len; i++) {
      matcher = matcher.add(predicates[i])
    }
    return matcher
  }
}

/**
 * @category combinators
 * @since 1.0.0
 */
export const discriminatorsExhaustive: <D extends string>(
  field: D,
) => <
  R,
  P extends {
    readonly [Tag in Tags<D, R> & string]: (
      _: Extract<R, Record<D, Tag>>,
    ) => any
  },
>(
  fields: P,
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (u: I) => Unify<A | ReturnType<P[keyof P]>>
  : Unify<A | ReturnType<P[keyof P]>> = (field: string) => (fields: object) => {
    const addCases = discriminators(field)(fields)
    return (matcher: any) => exhaustive(addCases(matcher))
  }

/**
 * @category combinators
 * @since 1.0.0
 */
export const tag = discriminator("_tag")

/**
 * @category combinators
 * @since 1.0.0
 */
export const tags = discriminators("_tag")

/**
 * @category combinators
 * @since 1.0.0
 */
export const tagsExhaustive = discriminatorsExhaustive("_tag")

/**
 * @category combinators
 * @since 1.0.0
 */
export const not = <
  R,
  const P extends PatternPrimitive<R> | PatternBase<R>,
  Fn extends (_: NotMatch<R, P>) => unknown,
>(
  pattern: P,
  f: Fn,
) =>
<I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
): Matcher<
  I,
  AddOnly<F, WhenMatch<R, P>>,
  ApplyFilters<I, AddOnly<F, WhenMatch<R, P>>>,
  A | ReturnType<Fn>,
  Pr
> => (self as any).add(new Not(makePredicate(pattern), f as any))

/**
 * @since 1.0.0
 */
export const SafeRefinementId = Symbol.for("@effect/match/SafeRefinementId")

/**
 * @since 1.0.0
 */
export type SafeRefinementId = typeof SafeRefinementId

/**
 * @category model
 * @since 1.0.0
 */
export interface SafeRefinement<A, R = A> {
  readonly [SafeRefinementId]: SafeRefinementId
  readonly _A: A
  readonly _R: R
}

/**
 * @category predicates
 * @since 1.0.0
 */
export const nonEmptyString: SafeRefinement<string, never> =
  ((u: unknown) => typeof u === "string" && u.length > 0) as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const is: <
  Literals extends ReadonlyArray<string | number | boolean | null | bigint>,
>(
  ...literals: Literals
) => Refinement<unknown, Literals[number]> = (...literals): any => {
  const len = literals.length
  return (u: unknown) => {
    for (let i = 0; i < len; i++) {
      if (u === literals[i]) {
        return true
      }
    }
    return false
  }
}

/**
 * @category predicates
 * @since 1.0.0
 */
export const string: Refinement<unknown, string> = P.isString

/**
 * @category predicates
 * @since 1.0.0
 */
export const number: Refinement<unknown, number> = P.isNumber

/**
 * @category predicates
 * @since 1.0.0
 */
export const any: SafeRefinement<unknown, any> = (() => true) as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const defined = <A>(u: A): u is A & {} =>
  (u !== undefined && u !== null) as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const boolean: Refinement<unknown, boolean> = P.isBoolean

const _undefined: Refinement<unknown, undefined> = P.isUndefined
export {
  /**
   * @category predicates
   * @since 1.0.0
   */
  _undefined as undefined,
}

const _null: Refinement<unknown, null> = P.isNull
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
export const bigint: Refinement<unknown, bigint> = P.isBigint

/**
 * @category predicates
 * @since 1.0.0
 */
export const date: Refinement<unknown, Date> = P.isDate

/**
 * @category predicates
 * @since 1.0.0
 */
export const record: Refinement<
  unknown,
  {
    [k: string]: any
    [k: symbol]: any
  }
> = P.isRecord

/**
 * @category predicates
 * @since 1.0.0
 */
export const instanceOf = <A extends abstract new(...args: any) => any>(
  constructor: A,
): SafeRefinement<InstanceType<A>, never> =>
  ((u: unknown) => u instanceof constructor) as any

/**
 * @category predicates
 * @since 1.0.0
 */
export const instanceOfUnsafe: <A extends abstract new(...args: any) => any>(
  constructor: A,
) => SafeRefinement<InstanceType<A>, InstanceType<A>> = instanceOf

/**
 * @category conversions
 * @since 1.0.0
 */
export const orElse = <RA, B>(f: (b: RA) => B) =>
<I, R, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
): [Pr] extends [never] ? (input: I) => Unify<A | B> : Unify<A | B> => {
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
export const orElseAbsurd = <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>,
): [Pr] extends [never] ? (input: I) => Unify<A> : Unify<A> =>
  orElse(() => {
    throw new Error("absurd")
  })(self)

/**
 * @category conversions
 * @since 1.0.0
 */
export const either: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => E.Either<R, Unify<A>>
  : E.Either<R, Unify<A>> = (<I, R, RA, A>(self: Matcher<I, R, RA, A, I>) => {
    if (self._tag === "ValueMatcher") {
      return self.value
    }

    const len = self.cases.length
    return (input: I): E.Either<RA, A> => {
      for (let i = 0; i < len; i++) {
        const _case = self.cases[i]
        if (_case._tag === "When" && _case.guard(input) === true) {
          return E.right(_case.evaluate(input))
        } else if (_case._tag === "Not" && _case.guard(input) === false) {
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
export const option: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>,
) => [Pr] extends [never] ? (input: I) => O.Option<Unify<A>>
  : O.Option<Unify<A>> = (<I, A>(self: Matcher<I, any, any, A, I>) => {
    const toEither = either(self)
    if (E.isEither(toEither)) {
      return E.match(toEither, {
        onLeft: () => O.none(),
        onRight: O.some,
      })
    }
    return (input: I): O.Option<A> =>
      E.match((toEither as any)(input), {
        onLeft: () => O.none(),
        onRight: (_: A) => O.some(_),
      })
  }) as any

/**
 * @category conversions
 * @since 1.0.0
 */
export const exhaustive: <I, F, A, Pr>(
  self: Matcher<I, F, never, A, Pr>,
) => [Pr] extends [never] ? (u: I) => Unify<A> : Unify<A> = (<I, F, A>(
  self: Matcher<I, F, never, A, I>,
) => {
  const toEither = either(self as any)

  if (E.isEither(toEither)) {
    if (toEither._tag === "Right") {
      return toEither.right
    }

    throw new Error("@effect/match: exhaustive absurd")
  }

  return (u: I): A => {
    // @ts-expect-error
    const result = toEither(u)

    if (result._tag === "Right") {
      return result.right as any
    }

    throw new Error("@effect/match: exhaustive absurd")
  }
}) as any

// type helpers

// combinations
type WhenMatch<R, P> =
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

type NotMatch<R, P> = Exclude<R, ExtractMatch<R, PForExclude<P>>>

type PForMatch<P> = SafeRefinementP<ResolvePred<P>>
type PForExclude<P> = SafeRefinementR<ToSafeRefinement<P>>

// utilities
type PredicateA<A> = Predicate<A> | Refinement<A, A>

type SafeRefinementP<A> = A extends never ? never
  : A extends SafeRefinement<infer S, infer _> ? S
  : A extends Function ? A
  : A extends Record<string, any> ? { [K in keyof A]: SafeRefinementP<A[K]> }
  : A

type SafeRefinementR<A> = A extends never ? never
  : A extends SafeRefinement<infer _, infer R> ? R
  : A extends Function ? A
  : A extends Record<string, any> ? { [K in keyof A]: SafeRefinementR<A[K]> }
  : A

type ResolvePred<A> = A extends never ? never
  : A extends Refinement<any, infer P> ? P
  : A extends Predicate<infer P> ? P
  : A extends SafeRefinement<any> ? A
  : A extends Record<string, any> ? { [K in keyof A]: ResolvePred<A[K]> }
  : A

type ToSafeRefinement<A> = A extends never ? never
  : A extends Refinement<any, infer P> ? SafeRefinement<P, P>
  : A extends Predicate<infer P> ? SafeRefinement<P, never>
  : A extends SafeRefinement<any> ? A
  : A extends Record<string, any> ? { [K in keyof A]: ToSafeRefinement<A[K]> }
  : NonLiteralsTo<A, never>

type NonLiteralsTo<A, T> = [A] extends [string | number | boolean | bigint]
  ? [string] extends [A] ? T
  : [number] extends [A] ? T
  : [boolean] extends [A] ? T
  : [bigint] extends [A] ? T
  : A
  : A

type PatternBase<A> = A extends ReadonlyArray<infer _T>
  ? ReadonlyArray<any> | PatternPrimitive<A>
  : A extends Record<string, any> ? Partial<
      {
        [K in keyof A]: PatternPrimitive<A[K] & {}> | PatternBase<A[K] & {}>
      }
    >
  : never

type PatternPrimitive<A> = PredicateA<A> | A | SafeRefinement<any>

interface Without<X> {
  readonly _tag: "Without"
  readonly _X: X
}

interface Only<X> {
  readonly _tag: "Only"
  readonly _X: X
}

type AddWithout<A, X> = [A] extends [Without<infer WX>] ? Without<X | WX>
  : [A] extends [Only<infer OX>] ? Only<Exclude<OX, X>>
  : never

type AddOnly<A, X> = [A] extends [Without<infer WX>] ? [X] extends [WX] ? never
  : Only<X>
  : [A] extends [Only<infer OX>] ? [X] extends [OX] ? Only<X>
    : never
  : never

type ApplyFilters<I, A> = A extends Only<infer X> ? X
  : A extends Without<infer X> ? Exclude<I, X>
  : never

type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
  x: infer R,
) => any ? R
  : never

type ArrayToIntersection<A extends ReadonlyArray<any>> = UnionToIntersection<
  A[number]
>
