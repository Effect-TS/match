---
title: ADT.ts
nav_order: 1
parent: Modules
---

## ADT overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [adt](#adt)
  - [adt1](#adt1)
  - [adt2](#adt2)
  - [adt3](#adt3)
- [model](#model)
  - [ADT (type alias)](#adt-type-alias)

---

# constructors

## adt

**Signature**

```ts
export declare function adt<A extends ADT.Constructor>(): ADT.Constructor4<A>
```

Added in v1.0.0

## adt1

**Signature**

```ts
export declare function adt1<A extends ADT.Constructor>(): ADT.Constructor1<A>
```

Added in v1.0.0

## adt2

**Signature**

```ts
export declare function adt2<A extends ADT.Constructor>(): ADT.Constructor2<A>
```

Added in v1.0.0

## adt3

**Signature**

```ts
export declare function adt3<A extends ADT.Constructor>(): ADT.Constructor3<A>
```

Added in v1.0.0

# model

## ADT (type alias)

**Signature**

```ts
export type ADT<A extends Record<string, Record<string, any>>> = {
  [K in keyof A]: Data.Data<Simplify<Readonly<A[K]> & { readonly _tag: K }>>
}[keyof A]
```

Added in v1.0.0
