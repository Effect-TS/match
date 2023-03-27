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
  - [not](#not)
  - [tag](#tag)
  - [when](#when)
- [constructors](#constructors)
  - [type](#type)
  - [value](#value)
- [conversions](#conversions)
  - [either](#either)
  - [exhaustive](#exhaustive)
  - [option](#option)
  - [orElse](#orelse)
- [model](#model)
  - [Matcher (type alias)](#matcher-type-alias)
  - [SafeSchema (interface)](#safeschema-interface)
- [predicates](#predicates)
  - [any](#any)
  - [bigint](#bigint)
  - [boolean](#boolean)
  - [date](#date)
  - [is](#is)
  - [null](#null)
  - [number](#number)
  - [safe](#safe)
  - [string](#string)
  - [undefined](#undefined)
  - [unsafe](#unsafe)
- [utils](#utils)
  - [\_null](#_null)
  - [\_undefined](#_undefined)

---

# combinators

## discriminator

**Signature**

```ts
export declare const discriminator: <D extends string>(
  field: D
) => <
  R,
  P extends
    | (Tags<D, R> & string)
    | (Tags<D, R> & number)
    | (Tags<D, R> & symbol)
    | (Tags<D, R> & object)
    | (Tags<D, R> & {}),
  B
>(
  first: P,
  ...values: (P | ((_: Extract<R, { readonly _tag: P }>) => B))[]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, { _tag: P }>>,
  ApplyFilters<I, AddWithout<F, Extract<R, { _tag: P }>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## not

**Signature**

```ts
export declare const not: {
  <R, P extends PredicateA<R>, B>(pattern: P, f: (_: Exclude<R, any>) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<I, AddOnly<F, any>, ApplyFilters<I, AddOnly<F, any>>, B | A, Pr>
  <R, P extends PatternBase<R>, B>(pattern: Narrow<P>, f: (_: Exclude<R, any>) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<I, AddOnly<F, any>, ApplyFilters<I, AddOnly<F, any>>, B | A, Pr>
  <P, SR, R, B>(schema: SafeSchema<P, SR>, f: (_: Exclude<R, any>) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<I, AddOnly<F, any>, ApplyFilters<I, AddOnly<F, any>>, B | A, Pr>
}
```

Added in v1.0.0

## tag

**Signature**

```ts
export declare const tag: <R, P, B>(
  first: P,
  ...values: (P | ((_: Extract<R, { readonly _tag: P }>) => B))[]
) => <I, F, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => Matcher<
  I,
  AddWithout<F, Extract<R, { _tag: P }>>,
  ApplyFilters<I, AddWithout<F, Extract<R, { _tag: P }>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## when

**Signature**

```ts
export declare const when: {
  <R, P extends PredicateA<R>, B>(pattern: P, f: (_: any) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<
    I,
    AddWithout<F, RemoveInvalidPatterns<SafeSchemaR<PredToSchema<P>>>>,
    ApplyFilters<I, AddWithout<F, RemoveInvalidPatterns<SafeSchemaR<PredToSchema<P>>>>>,
    B | A,
    Pr
  >
  <R, P extends PatternBase<R>, B>(pattern: Narrow<P>, f: (_: any) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<
    I,
    AddWithout<F, RemoveInvalidPatterns<SafeSchemaR<PredToSchema<P>>>>,
    ApplyFilters<I, AddWithout<F, RemoveInvalidPatterns<SafeSchemaR<PredToSchema<P>>>>>,
    B | A,
    Pr
  >
  <P, SR, R, B>(schema: SafeSchema<P, SR>, f: (_: any) => B): <I, F, A, Pr>(
    self: Matcher<I, F, R, A, Pr>
  ) => Matcher<I, AddWithout<F, any>, ApplyFilters<I, AddWithout<F, any>>, B | A, Pr>
}
```

Added in v1.0.0

# constructors

## type

**Signature**

```ts
export declare const type: <I>() => Matcher<I, Without<never>, I, never, never>
```

Added in v1.0.0

## value

**Signature**

```ts
export declare const value: <I>(i: I) => Matcher<I, Without<never>, I, never, I>
```

Added in v1.0.0

# conversions

## either

**Signature**

```ts
export declare const either: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (input: I) => E.Either<R, A> : E.Either<R, A>
```

Added in v1.0.0

## exhaustive

**Signature**

```ts
export declare const exhaustive: <I, F, A, Pr>(
  self: Matcher<I, F, never, A, Pr>
) => [Pr] extends [never] ? (u: I) => A : A
```

Added in v1.0.0

## option

**Signature**

```ts
export declare const option: <I, F, R, A, Pr>(
  self: Matcher<I, F, R, A, Pr>
) => [Pr] extends [never] ? (input: I) => O.Option<A> : O.Option<A>
```

Added in v1.0.0

## orElse

**Signature**

```ts
export declare const orElse: <RA, B>(
  f: (b: RA) => B
) => <I, R, A, Pr>(self: Matcher<I, R, RA, A, Pr>) => [Pr] extends [never] ? (input: I) => B | A : B | A
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
  readonly _tag: 'SafeSchema'
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
export declare const bigint: SafeSchema<bigint, bigint>
```

Added in v1.0.0

## boolean

**Signature**

```ts
export declare const boolean: SafeSchema<boolean, boolean>
```

Added in v1.0.0

## date

**Signature**

```ts
export declare const date: SafeSchema<Date, Date>
```

Added in v1.0.0

## is

**Signature**

```ts
export declare const is: <Literals extends readonly LiteralValue[]>(
  ...a: Literals
) => SafeSchema<Literals[number], Literals[number]>
```

Added in v1.0.0

## null

**Signature**

```ts
export declare const null: SafeSchema<null, null>
```

Added in v1.0.0

## number

**Signature**

```ts
export declare const number: SafeSchema<number, number>
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
export declare const string: SafeSchema<string, string>
```

Added in v1.0.0

## undefined

**Signature**

```ts
export declare const undefined: SafeSchema<undefined, undefined>
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

## \_null

**Signature**

```ts
export declare const _null: SafeSchema<null, null>
```

Added in v1.0.0

## \_undefined

**Signature**

```ts
export declare const _undefined: SafeSchema<undefined, undefined>
```

Added in v1.0.0
