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
  - [exaustive](#exaustive)
  - [option](#option)
  - [orElse](#orelse)
- [model](#model)
  - [Matcher (type alias)](#matcher-type-alias)
- [predicates](#predicates)
  - [is](#is)

---

# combinators

## not

**Signature**

```ts
export declare const not: {
  <RA, P extends PatternBase<RA>, B>(pattern: Narrow<P>, f: (_: Exclude<RA, ResolveSchema<PredToSchema<P>>>) => B): <
    I,
    R,
    A,
    Pr
  >(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<
    I,
    AddOnly<R, ResolveSchema<ResolvePred<P>>>,
    ApplyFilters<AddOnly<R, ResolveSchema<ResolvePred<P>>>>,
    B | A,
    Pr
  >
  <P, RA, B>(schema: S.Schema<P>, f: (_: Exclude<RA, P>) => B): <I, R, A, Pr>(
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
    f: (_: Replace<TryExtract<RA, ResolveSchema<ResolvePred<P>>>, ResolveSchema<ResolvePred<P>>>) => B
  ): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<
    I,
    AddWithout<R, ResolveSchema<PredToSchema<P>>>,
    ApplyFilters<AddWithout<R, ResolveSchema<PredToSchema<P>>>>,
    B | A,
    Pr
  >
  <P, RA, B>(schema: S.Schema<P>, f: (_: Replace<TryExtract<RA, P>, P>) => B): <I, R, A, Pr>(
    self: Matcher<I, R, RA, A, Pr>
  ) => Matcher<I, AddWithout<R, P>, ApplyFilters<AddWithout<R, P>>, B | A, Pr>
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

## exaustive

**Signature**

```ts
export declare const exaustive: <I, R, A, Pr>(
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

# predicates

## is

**Signature**

```ts
export declare const is: <Literals extends readonly AST.LiteralValue[]>(
  ...literals: Literals
) => S.Schema<Literals[number]>
```

Added in v1.0.0
