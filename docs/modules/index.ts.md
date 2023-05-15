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
  - [whenAnd](#whenand)
  - [whenOr](#whenor)
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
  - [defined](#defined)
  - [instanceOf](#instanceof)
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
  ...values: (P | ((_: Extract<R, Record<D, P>>) => B))[]
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

## not

**Signature**

```ts
export declare const not: any
```

Added in v1.0.0

## tag

**Signature**

```ts
export declare const tag: <R, P, B>(
  first: P,
  ...values: (P | ((_: Extract<R, Record<'_tag', P>>) => B))[]
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

## when

**Signature**

```ts
export declare const when: any
```

Added in v1.0.0

## whenAnd

**Signature**

```ts
export declare const whenAnd: any
```

Added in v1.0.0

## whenOr

**Signature**

```ts
export declare const whenOr: any
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
export declare const instanceOf: new (...args: any) => any
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
export declare const record: Refinement<unknown, { [k: string]: any }>
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

## \_null

**Signature**

```ts
export declare const _null: Refinement<unknown, null>
```

Added in v1.0.0

## \_undefined

**Signature**

```ts
export declare const _undefined: Refinement<unknown, undefined>
```

Added in v1.0.0
