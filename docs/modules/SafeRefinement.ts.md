---
title: SafeRefinement.ts
nav_order: 2
parent: Modules
---

## SafeRefinement overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [model](#model)
  - [SafeRefinement (interface)](#saferefinement-interface)
- [utils](#utils)
  - [SafeRefinementId](#saferefinementid)
  - [SafeRefinementId (type alias)](#saferefinementid-type-alias)

---

# model

## SafeRefinement (interface)

**Signature**

```ts
export interface SafeRefinement<A, R = A> {
  readonly [SafeRefinementId]: (a: A) => R
}
```

Added in v1.0.0

# utils

## SafeRefinementId

**Signature**

```ts
export declare const SafeRefinementId: typeof SafeRefinementId
```

Added in v1.0.0

## SafeRefinementId (type alias)

**Signature**

```ts
export type SafeRefinementId = typeof SafeRefinementId
```

Added in v1.0.0
