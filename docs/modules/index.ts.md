---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [discriminator](#discriminator)
  - [discriminatorStartsWith](#discriminatorstartswith)
  - [discriminators](#discriminators)
  - [discriminatorsExhaustive](#discriminatorsexhaustive)
  - [not](#not)
  - [tag](#tag)
  - [tagStartsWith](#tagstartswith)
  - [tags](#tags)
  - [tagsExhaustive](#tagsexhaustive)
  - [when](#when)
  - [whenAnd](#whenand)
  - [whenOr](#whenor)
- [constructors](#constructors)
  - [type](#type)
  - [typeTags](#typetags)
  - [value](#value)
  - [valueTags](#valuetags)
- [conversions](#conversions)
  - [either](#either)
  - [exhaustive](#exhaustive)
  - [option](#option)
  - [orElse](#orelse)
  - [orElseAbsurd](#orelseabsurd)
- [model](#model)
  - [Case (type alias)](#case-type-alias)
  - [Matcher (type alias)](#matcher-type-alias)
  - [Not (interface)](#not-interface)
  - [TypeMatcher (interface)](#typematcher-interface)
  - [ValueMatcher (interface)](#valuematcher-interface)
  - [When (interface)](#when-interface)
- [predicates](#predicates)
  - [any](#any)
  - [bigint](#bigint)
  - [boolean](#boolean)
  - [date](#date)
  - [defined](#defined)
  - [instanceOf](#instanceof)
  - [instanceOfUnsafe](#instanceofunsafe)
  - [is](#is)
  - [nonEmptyString](#nonemptystring)
  - [null](#null)
  - [number](#number)
  - [record](#record)
  - [string](#string)
  - [undefined](#undefined)
- [type ids](#type-ids)
  - [MatcherTypeId](#matchertypeid)
  - [MatcherTypeId (type alias)](#matchertypeid-type-alias)

---

# combinators

## discriminator

**Signature**

```ts
export declare const discriminator: <D extends string>(
  field: D
) => <R, P extends Types.Tags<D, R> & string, B>(
  ...pattern: [first: P, ...values: P[], f: (_: Extract<R, Record<D, P>>) => B]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<D, P>>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## discriminatorStartsWith

**Signature**

```ts
export declare const discriminatorStartsWith: <D extends string>(
  field: D
) => <R, P extends string, B>(
  pattern: P,
  f: (_: Extract<R, Record<D, `${P}${string}`>>) => B
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, `${P}${string}`>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<D, `${P}${string}`>>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## discriminators

**Signature**

```ts
export declare const discriminators: <D extends string>(
  field: D
) => <
  R,
  P extends { readonly [Tag in Types.Tags<D, R> & string]?: ((_: Extract<R, Record<D, Tag>>) => any) | undefined }
>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<D, keyof P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<D, keyof P>>>>,
  A | ReturnType<P[keyof P] & {}>,
  Pr
>
```

Added in v1.0.0

## discriminatorsExhaustive

**Signature**

```ts
export declare const discriminatorsExhaustive: <D extends string>(
  field: D
) => <R, P extends { readonly [Tag in Types.Tags<D, R> & string]: (_: Extract<R, Record<D, Tag>>) => any }>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (u: I) => Unify<A | ReturnType<P[keyof P]>> : Unify<A | ReturnType<P[keyof P]>>
```

Added in v1.0.0

## not

**Signature**

```ts
export declare const not: <
  R,
  const P extends Types.PatternPrimitive<R> | Types.PatternBase<R>,
  Fn extends (_: Exclude<R, Types.ExtractMatch<R, Types.PForExclude<P>>>) => unknown
>(
  pattern: P,
  f: Fn
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddOnly<F, Types.WhenMatch<R, P>>,
  Types.ApplyFilters<I, Types.AddOnly<F, Types.WhenMatch<R, P>>>,
  A | ReturnType<Fn>,
  Pr
>
```

Added in v1.0.0

## tag

**Signature**

```ts
export declare const tag: <R, P extends Types.Tags<'_tag', R> & string, B>(
  ...pattern: [first: P, ...values: P[], f: (_: Extract<R, Record<'_tag', P>>) => B]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<'_tag', P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<'_tag', P>>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## tagStartsWith

**Signature**

```ts
export declare const tagStartsWith: <R, P extends string, B>(
  pattern: P,
  f: (_: Extract<R, Record<'_tag', `${P}${string}`>>) => B
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<'_tag', `${P}${string}`>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<'_tag', `${P}${string}`>>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## tags

**Signature**

```ts
export declare const tags: <
  R,
  P extends {
    readonly [Tag in Types.Tags<'_tag', R> & string]?: ((_: Extract<R, Record<'_tag', Tag>>) => any) | undefined
  }
>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Extract<R, Record<'_tag', keyof P>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Extract<R, Record<'_tag', keyof P>>>>,
  A | ReturnType<P[keyof P] & {}>,
  Pr
>
```

Added in v1.0.0

## tagsExhaustive

**Signature**

```ts
export declare const tagsExhaustive: <
  R,
  P extends { readonly [Tag in Types.Tags<'_tag', R> & string]: (_: Extract<R, Record<'_tag', Tag>>) => any }
>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (u: I) => Unify<A | ReturnType<P[keyof P]>> : Unify<A | ReturnType<P[keyof P]>>
```

Added in v1.0.0

## when

**Signature**

```ts
export declare const when: <
  R,
  const P extends Types.PatternPrimitive<R> | Types.PatternBase<R>,
  Fn extends (_: Types.WhenMatch<R, P>) => unknown
>(
  pattern: P,
  f: Fn
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<P>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Types.PForExclude<P>>>,
  A | ReturnType<Fn>,
  Pr
>
```

Added in v1.0.0

## whenAnd

**Signature**

```ts
export declare const whenAnd: <
  R,
  const P extends readonly (Types.PatternPrimitive<R> | Types.PatternBase<R>)[],
  Fn extends (_: Types.WhenMatch<R, UnionToIntersection<P[number]>>) => unknown
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<UnionToIntersection<P[number]>>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Types.PForExclude<UnionToIntersection<P[number]>>>>,
  A | ReturnType<Fn>,
  Pr
>
```

Added in v1.0.0

## whenOr

**Signature**

```ts
export declare const whenOr: <
  R,
  const P extends readonly (Types.PatternPrimitive<R> | Types.PatternBase<R>)[],
  Fn extends (_: Types.WhenMatch<R, P[number]>) => unknown
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  Types.AddWithout<F, Types.PForExclude<P[number]>>,
  Types.ApplyFilters<I, Types.AddWithout<F, Types.PForExclude<P[number]>>>,
  A | ReturnType<Fn>,
  Pr
>
```

Added in v1.0.0

# constructors

## type

**Signature**

```ts
export declare const type: <I>() => Matcher<I, Types.Without<never>, I, never, never>
```

Added in v1.0.0

## typeTags

**Signature**

```ts
export declare const typeTags: <I>() => <
  P extends { readonly [Tag in Types.Tags<'_tag', I> & string]: (_: Extract<I, { readonly _tag: Tag }>) => any }
>(
  fields: P
) => (input: I) => Unify<ReturnType<P[keyof P]>>
```

Added in v1.0.0

## value

**Signature**

```ts
export declare const value: <const I>(i: I) => Matcher<I, Types.Without<never>, I, never, I>
```

Added in v1.0.0

## valueTags

**Signature**

```ts
export declare const valueTags: <
  const I,
  P extends { readonly [Tag in Types.Tags<'_tag', I> & string]: (_: Extract<I, { readonly _tag: Tag }>) => any }
>(
  fields: P
) => (input: I) => Unify<ReturnType<P[keyof P]>>
```

Added in v1.0.0

# conversions

## either

**Signature**

```ts
export declare const either: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (input: I) => E.Either<R, Unify<A>> : E.Either<R, Unify<A>>
```

Added in v1.0.0

## exhaustive

**Signature**

```ts
export declare const exhaustive: <I, F, A, Pr>(
  self: Matcher<I, F, never, A, Pr>
) => [Pr] extends [never] ? (u: I) => Unify<A> : Unify<A>
```

Added in v1.0.0

## option

**Signature**

```ts
export declare const option: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (input: I) => O.Option<Unify<A>> : O.Option<Unify<A>>
```

Added in v1.0.0

## orElse

**Signature**

```ts
export declare const orElse: <RA, B>(
  f: (b: RA) => B
) => <I, R, A, Pr>(self: Matcher<I, R, RA, A, Pr>) => [Pr] extends [never] ? (input: I) => Unify<B | A> : Unify<B | A>
```

Added in v1.0.0

## orElseAbsurd

**Signature**

```ts
export declare const orElseAbsurd: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>
) => [Pr] extends [never] ? (input: I) => Unify<A> : Unify<A>
```

Added in v1.0.0

# model

## Case (type alias)

**Signature**

```ts
export type Case = When | Not
```

Added in v1.0.0

## Matcher (type alias)

**Signature**

```ts
export type Matcher<Input, Filters, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided>
```

Added in v1.0.0

## Not (interface)

**Signature**

```ts
export interface Not {
  readonly _tag: 'Not'
  readonly guard: (u: unknown) => boolean
  readonly evaluate: (input: unknown) => any
}
```

Added in v1.0.0

## TypeMatcher (interface)

**Signature**

```ts
export interface TypeMatcher<Input, Filters, Remaining, Result> extends Pipeable {
  readonly _tag: 'TypeMatcher'
  readonly [MatcherTypeId]: {
    readonly _input: (_: Input) => unknown
    readonly _filters: (_: never) => Filters
    readonly _remaining: (_: never) => Remaining
    readonly _result: (_: never) => Result
  }
  readonly cases: ReadonlyArray<Case>
  readonly add: <I, R, RA, A>(_case: Case) => TypeMatcher<I, R, RA, A>
}
```

Added in v1.0.0

## ValueMatcher (interface)

**Signature**

```ts
export interface ValueMatcher<Input, Filters, Remaining, Result, Provided> extends Pipeable {
  readonly _tag: 'ValueMatcher'
  readonly [MatcherTypeId]: {
    readonly _input: (_: Input) => unknown
    readonly _filters: (_: never) => Filters
    readonly _result: (_: never) => Result
  }
  readonly provided: Provided
  readonly value: E.Either<Remaining, Provided>
  readonly add: <I, R, RA, A, Pr>(_case: Case) => ValueMatcher<I, R, RA, A, Pr>
}
```

Added in v1.0.0

## When (interface)

**Signature**

```ts
export interface When {
  readonly _tag: 'When'
  readonly guard: (u: unknown) => boolean
  readonly evaluate: (input: unknown) => any
}
```

Added in v1.0.0

# predicates

## any

**Signature**

```ts
export declare const any: SafeRefinement<unknown, any>
```

Added in v1.0.0

## bigint

**Signature**

```ts
export declare const bigint: Predicate.Refinement<unknown, bigint>
```

Added in v1.0.0

## boolean

**Signature**

```ts
export declare const boolean: Predicate.Refinement<unknown, boolean>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: Predicate.Refinement<unknown, Date>
```

Added in v1.0.0

## defined

**Signature**

```ts
export declare const defined: <A>(u: A) => u is A & {}
```

Added in v1.0.0

## instanceOf

**Signature**

```ts
export declare const instanceOf: <A extends abstract new (...args: any) => any>(
  constructor: A
) => SafeRefinement<InstanceType<A>, never>
```

Added in v1.0.0

## instanceOfUnsafe

**Signature**

```ts
export declare const instanceOfUnsafe: <A extends abstract new (...args: any) => any>(
  constructor: A
) => SafeRefinement<InstanceType<A>, InstanceType<A>>
```

Added in v1.0.0

## is

**Signature**

```ts
export declare const is: <Literals extends readonly (string | number | bigint | boolean | null)[]>(
  ...literals: Literals
) => Predicate.Refinement<unknown, Literals[number]>
```

Added in v1.0.0

## nonEmptyString

**Signature**

```ts
export declare const nonEmptyString: SafeRefinement<string, never>
```

Added in v1.0.0

## null

**Signature**

```ts
export declare const null: Predicate.Refinement<unknown, null>
```

Added in v1.0.0

## number

**Signature**

```ts
export declare const number: Predicate.Refinement<unknown, number>
```

Added in v1.0.0

## record

**Signature**

```ts
export declare const record: Predicate.Refinement<unknown, { [k: string]: any; [k: symbol]: any }>
```

Added in v1.0.0

## string

**Signature**

```ts
export declare const string: Predicate.Refinement<unknown, string>
```

Added in v1.0.0

## undefined

**Signature**

```ts
export declare const undefined: Predicate.Refinement<unknown, undefined>
```

Added in v1.0.0

# type ids

## MatcherTypeId

**Signature**

```ts
export declare const MatcherTypeId: typeof MatcherTypeId
```

Added in v1.0.0

## MatcherTypeId (type alias)

**Signature**

```ts
export type MatcherTypeId = typeof MatcherTypeId
```

Added in v1.0.0
