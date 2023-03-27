---
title: TaggedEnum.ts
nav_order: 3
parent: Modules
---

## TaggedEnum overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [taggedEnum](#taggedenum)

---

# constructors

## taggedEnum

Create a tagged enum data type, which is a union of `Data` structs.

```ts
const HttpError = taggedEnum<{
  BadRequest: { status: 400; message: string }
  NotFound: { status: 404; message: string }
}>()

const notFound = HttpError('NotFound')({ status: 404, message: 'Not Found' })
```

**Signature**

```ts
export declare function taggedEnum<A extends Record<string, Record<string, any>>>(): TaggedEnum.Constructor<A>
```

Added in v1.0.0
