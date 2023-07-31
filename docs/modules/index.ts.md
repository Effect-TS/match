---
title: index.ts
nav_order: 2
parent: Modules
---

## index overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [combinators](#combinators)
  - [discriminator](#discriminator)
  - [discriminators](#discriminators)
  - [discriminatorsExhaustive](#discriminatorsexhaustive)
  - [not](#not)
  - [tag](#tag)
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
  - [Matcher (type alias)](#matcher-type-alias)
  - [SafeSchema (interface)](#safeschema-interface)
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
  - [safe](#safe)
  - [string](#string)
  - [undefined](#undefined)
  - [unsafe](#unsafe)
- [utils](#utils)
  - [SafeSchemaId](#safeschemaid)
  - [SafeSchemaId (type alias)](#safeschemaid-type-alias)

---

# combinators

## discriminator

**Signature**

```ts
export declare const discriminator: <D extends string>(
  field: D
) => <R, P extends Tags<D, R> & string, B>(
  ...pattern: [first: P, ...values: P[], f: (_: Extract<R, Record<D, P>>) => B]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, Record<D, P>>>,
  ApplyFilters<I, AddWithout<F, Extract<R, Record<D, P>>>>,
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
) => <R, P extends { readonly [Tag in Tags<D, R> & string]?: ((_: Extract<R, Record<D, Tag>>) => any) | undefined }>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, Record<D, keyof P>>>,
  ApplyFilters<I, AddWithout<F, Extract<R, Record<D, keyof P>>>>,
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
) => <R, P extends { readonly [Tag in Tags<D, R> & string]: (_: Extract<R, Record<D, Tag>>) => any }>(
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
  const P extends PatternPrimitive<R> | PatternBase<R>,
  Fn extends (_: Exclude<R, ExtractMatch<R, SafeSchemaR<PredToSchema<P>>>>) => unknown
>(
  pattern: P,
  f: Fn
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<I, AddOnly<F, WhenMatch<R, P>>, ApplyFilters<I, AddOnly<F, WhenMatch<R, P>>>, A | ReturnType<Fn>, Pr>
```

Added in v1.0.0

## tag

**Signature**

```ts
export declare const tag: <R, P, B>(
  ...pattern: [first: P, ...values: P[], f: (_: Extract<R, Record<'_tag', P>>) => B]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, Record<'_tag', P>>>,
  ApplyFilters<I, AddWithout<F, Extract<R, Record<'_tag', P>>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## tags

**Signature**

```ts
export declare const tags: <R, P>(
  fields: P
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, Record<'_tag', keyof P>>>,
  ApplyFilters<I, AddWithout<F, Extract<R, Record<'_tag', keyof P>>>>,
  A | ReturnType<P[keyof P] & {}>,
  Pr
>
```

Added in v1.0.0

## tagsExhaustive

**Signature**

```ts
export declare const tagsExhaustive: <R, P>(
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
  const P extends PatternPrimitive<R> | PatternBase<R>,
  Fn extends (_: WhenMatch<R, P>) => unknown
>(
  pattern: P,
  f: Fn
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, SafeSchemaR<PredToSchema<P>>>,
  ApplyFilters<I, AddWithout<F, SafeSchemaR<PredToSchema<P>>>>,
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
  const P extends readonly (PatternPrimitive<R> | PatternBase<R>)[],
  Fn extends (_: WhenMatch<R, UnionToIntersection<P[number]>>) => unknown
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, SafeSchemaR<PredToSchema<UnionToIntersection<P[number]>>>>,
  ApplyFilters<I, AddWithout<F, SafeSchemaR<PredToSchema<UnionToIntersection<P[number]>>>>>,
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
  const P extends readonly (PatternPrimitive<R> | PatternBase<R>)[],
  Fn extends (_: WhenMatch<R, P[number]>) => unknown
>(
  ...args: [...patterns: P, f: Fn]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, SafeSchemaR<PredToSchema<P[number]>>>,
  ApplyFilters<I, AddWithout<F, SafeSchemaR<PredToSchema<P[number]>>>>,
  A | ReturnType<Fn>,
  Pr
>
```

Added in v1.0.0

# constructors

## type

**Signature**

```ts
export declare const type: <I>() => Matcher<I, Without<never>, I, never, never>
```

Added in v1.0.0

## typeTags

**Signature**

```ts
export declare const typeTags: <I>() => <
  P extends { readonly [Tag in Tags<'_tag', I> & string]: (_: Extract<I, { readonly _tag: Tag }>) => any }
>(
  fields: P
) => (input: I) => Unify<ReturnType<P[keyof P]>>
```

Added in v1.0.0

## value

**Signature**

```ts
export declare const value: <const I>(i: I) => Matcher<I, Without<never>, I, never, I>
```

Added in v1.0.0

## valueTags

**Signature**

```ts
export declare const valueTags: <
  const I,
  P extends { readonly [Tag in Tags<'_tag', I> & string]: (_: Extract<I, { readonly _tag: Tag }>) => any }
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

## Matcher (type alias)

**Signature**

```ts
export type Matcher<Input, Filters, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Filters, RemainingApplied, Result>
  | ValueMatcher<Input, Filters, RemainingApplied, Result, Provided>
```

Added in v1.0.0

## SafeSchema (interface)

**Signature**

```ts
export interface SafeSchema<A, R = A> {
  readonly [SafeSchemaId]: SafeSchemaId
  readonly _A: A
  readonly _R: R
}
```

Added in v1.0.0

# predicates

## any

**Signature**

```ts
export declare const any: SafeSchema<unknown, any>
```

Added in v1.0.0

## bigint

**Signature**

```ts
export declare const bigint: Refinement<unknown, bigint>
```

Added in v1.0.0

## boolean

**Signature**

```ts
export declare const boolean: Refinement<unknown, boolean>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: Refinement<unknown, Date>
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
) => SafeSchema<InstanceType<A>, never>
```

Added in v1.0.0

## instanceOfUnsafe

**Signature**

```ts
export declare const instanceOfUnsafe: <A extends abstract new (...args: any) => any>(
  constructor: A
) => SafeSchema<InstanceType<A>, InstanceType<A>>
```

Added in v1.0.0

## is

**Signature**

```ts
export declare const is: <Literals extends readonly LiteralValue[]>(
  ...literals: Literals
) => Refinement<unknown, Literals[number]>
```

Added in v1.0.0

## nonEmptyString

**Signature**

```ts
export declare const nonEmptyString: SafeSchema<string, never>
```

Added in v1.0.0

## null

**Signature**

```ts
export declare const null: Refinement<unknown, null>
```

Added in v1.0.0

## number

**Signature**

```ts
export declare const number: Refinement<unknown, number>
```

Added in v1.0.0

## record

**Signature**

```ts
export declare const record: Refinement<unknown, { [k: string]: any; [k: symbol]: any }>
```

Added in v1.0.0

## safe

Use a schema as a predicate, marking it **safe**. Safe means **it does not**
contain refinements that could make the pattern not match.

**Signature**

```ts
export declare const safe: <A>(schema: S.Schema<A, A>) => SafeSchema<A, A>
```

Added in v1.0.0

## string

**Signature**

```ts
export declare const string: Refinement<unknown, string>
```

Added in v1.0.0

## undefined

**Signature**

```ts
export declare const undefined: Refinement<unknown, undefined>
```

Added in v1.0.0

## unsafe

Use a schema as a predicate, marking it **unsafe**. Unsafe means it contains
refinements that could make the pattern not match.

**Signature**

```ts
export declare const unsafe: <A>(schema: S.Schema<A, A>) => SafeSchema<A, never>
```

Added in v1.0.0

# utils

## SafeSchemaId

**Signature**

```ts
export declare const SafeSchemaId: typeof SafeSchemaId
```

Added in v1.0.0

## SafeSchemaId (type alias)

**Signature**

```ts
export type SafeSchemaId = typeof SafeSchemaId
```

Added in v1.0.0
