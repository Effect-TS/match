---
title: Types.ts
nav_order: 3
parent: Modules
---

## Types overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [AddOnly (type alias)](#addonly-type-alias)
  - [AddWithout (type alias)](#addwithout-type-alias)
  - [ApplyFilters (type alias)](#applyfilters-type-alias)
  - [ArrayToIntersection (type alias)](#arraytointersection-type-alias)
  - [ExtractMatch (type alias)](#extractmatch-type-alias)
  - [NotMatch (type alias)](#notmatch-type-alias)
  - [Only (interface)](#only-interface)
  - [PForExclude (type alias)](#pforexclude-type-alias)
  - [PForMatch (type alias)](#pformatch-type-alias)
  - [PatternBase (type alias)](#patternbase-type-alias)
  - [PatternPrimitive (type alias)](#patternprimitive-type-alias)
  - [Tags (type alias)](#tags-type-alias)
  - [WhenMatch (type alias)](#whenmatch-type-alias)
  - [Without (interface)](#without-interface)

---

# utils

## AddOnly (type alias)

**Signature**

```ts
export type AddOnly<A, X> = [A] extends [Without<infer WX>]
  ? [X] extends [WX]
    ? never
    : Only<X>
  : [A] extends [Only<infer OX>]
  ? [X] extends [OX]
    ? Only<X>
    : never
  : never
```

Added in v1.0.0

## AddWithout (type alias)

**Signature**

```ts
export type AddWithout<A, X> = [A] extends [Without<infer WX>]
  ? Without<X | WX>
  : [A] extends [Only<infer OX>]
  ? Only<Exclude<OX, X>>
  : never
```

Added in v1.0.0

## ApplyFilters (type alias)

**Signature**

```ts
export type ApplyFilters<I, A> = A extends Only<infer X> ? X : A extends Without<infer X> ? Exclude<I, X> : never
```

Added in v1.0.0

## ArrayToIntersection (type alias)

**Signature**

```ts
export type ArrayToIntersection<A extends ReadonlyArray<any>> = UnionToIntersection<A[number]>
```

Added in v1.0.0

## ExtractMatch (type alias)

**Signature**

```ts
export type ExtractMatch<I, P> = [ExtractAndNarrow<I, P>] extends [infer EI] ? EI : never
```

Added in v1.0.0

## NotMatch (type alias)

**Signature**

```ts
export type NotMatch<R, P> = Exclude<R, ExtractMatch<R, PForExclude<P>>>
```

Added in v1.0.0

## Only (interface)

**Signature**

```ts
export interface Only<X> {
  readonly _tag: 'Only'
  readonly _X: X
}
```

Added in v1.0.0

## PForExclude (type alias)

**Signature**

```ts
export type PForExclude<P> = SafeRefinementR<ToSafeRefinement<P>>
```

Added in v1.0.0

## PForMatch (type alias)

**Signature**

```ts
export type PForMatch<P> = SafeRefinementP<ResolvePred<P>>
```

Added in v1.0.0

## PatternBase (type alias)

**Signature**

```ts
export type PatternBase<A> = A extends ReadonlyArray<infer _T>
  ? ReadonlyArray<any> | PatternPrimitive<A>
  : A extends Record<string, any>
  ? Partial<{
      [K in keyof A]: PatternPrimitive<A[K] & {}> | PatternBase<A[K] & {}>
    }>
  : never
```

Added in v1.0.0

## PatternPrimitive (type alias)

**Signature**

```ts
export type PatternPrimitive<A> = PredicateA<A> | A | SafeRefinement<any>
```

Added in v1.0.0

## Tags (type alias)

**Signature**

```ts
export type Tags<D extends string, P> = P extends Record<D, infer X> ? X : never
```

Added in v1.0.0

## WhenMatch (type alias)

**Signature**

```ts
export type WhenMatch<R, P> =
  // check for any
  [0] extends [1 & R]
    ? PForMatch<P>
    : P extends SafeRefinement<infer SP, never>
    ? SP
    : P extends Refinement<infer _R, infer RP>
    ? // try to narrow refinement
      [Extract<R, RP>] extends [infer X]
      ? [X] extends [never]
        ? // fallback to original refinement
          RP
        : X
      : never
    : P extends PredicateA<infer PP>
    ? PP
    : ExtractMatch<R, PForMatch<P>>
```

Added in v1.0.0

## Without (interface)

**Signature**

```ts
export interface Without<X> {
  readonly _tag: 'Without'
  readonly _X: X
}
```

Added in v1.0.0
