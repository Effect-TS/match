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

## not

**Signature**

```ts
export declare const not: {
  <RA, P extends PatternBase<RA>, B>(pattern: Narrow<P>, f: (_: Exclude<RA, SafeSchemaR<PredToSchema<P>>>) => B): <
    I,
    R,
    A,
    Pr
  >(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<
    I,
    AddOnly<R, SafeSchemaP<ResolvePred<P>>>,
    ApplyFilters<AddOnly<R, SafeSchemaP<ResolvePred<P>>>>,
    B | A,
    Pr
  >
  <P, SR, RA, B>(schema: SafeSchema<P, SR>, f: (_: Exclude<RA, SR>) => B): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<I, AddOnly<R, P>, ApplyFilters<AddOnly<R, P>>, B | A, Pr>
}
```

Added in v1.0.0

## tag

**Signature**

```ts
export declare const tag: <
  RA,
  P extends (Tags<RA> & string) | (Tags<RA> & number) | (Tags<RA> & symbol) | (Tags<RA> & object) | (Tags<RA> & {}),
  B
>(
  pattern: P,
  f: (_: Extract<RA, { readonly _tag: P }>) => B
) => <I, R, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>
) => Matcher<
  I,
  AddWithout<R, Extract<RA, { _tag: P }>>,
  ApplyFilters<AddWithout<R, Extract<RA, { _tag: P }>>>,
  B | A,
  Pr
>
```

Added in v1.0.0

## when

**Signature**

```ts
export declare const when: {
  <RA, P extends PatternBase<RA>, B>(
    pattern: Narrow<P>,
    f: (_: Replace<TryExtract<RA, SafeSchemaP<ResolvePred<P>>>, SafeSchemaP<ResolvePred<P>>>) => B
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<
    I,
    AddWithout<R, SafeSchemaR<PredToSchema<P>>>,
    ApplyFilters<AddWithout<R, SafeSchemaR<PredToSchema<P>>>>,
    B | A,
    Pr
  >
  <P, SR, RA, B>(schema: SafeSchema<P, SR>, f: (_: Replace<TryExtract<RA, P>, P>) => B): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<I, AddWithout<R, P>, ApplyFilters<AddWithout<R, SR>>, B | A, Pr>
}
```

Added in v1.0.0

# constructors

## type

**Signature**

```ts
export declare const type: <I>() => Matcher<I, I, I, never, never>
```

Added in v1.0.0

## value

**Signature**

```ts
export declare const value: <I>(i: I) => Matcher<I, I, I, never, I>
```

Added in v1.0.0

# conversions

## either

**Signature**

```ts
export declare const either: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>
) => [Pr] extends [never] ? (input: I) => E.Either<RA, A> : E.Either<RA, A>
```

Added in v1.0.0

## exhaustive

**Signature**

```ts
export declare const exhaustive: <I, R, A, Pr>(
  self: Matcher<I, R, never, A, Pr>
) => [Pr] extends [never] ? (u: I) => A : A
```

Added in v1.0.0

## option

**Signature**

```ts
export declare const option: <I, R, RA, A, Pr>(
  self: Matcher<I, R, RA, A, Pr>
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
export type Matcher<Input, Remaining, RemainingApplied, Result, Provided> =
  | TypeMatcher<Input, Remaining, RemainingApplied, Result>
  | ValueMatcher<Input, Remaining, RemainingApplied, Result, Provided>
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
export declare const is: <Literals extends readonly AST.LiteralValue[]>(
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
export declare const safe: <A, R = A>(schema: S.Schema<A>) => SafeSchema<A, R>
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
export declare const unsafe: <A>(schema: S.Schema<A>) => SafeSchema<A, never>
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
