<h3 align="center">
  <img src="https://raw.githubusercontent.com/Effect-TS/match/main/docs/example.png" width="700">
</h3>

<p align="center">
Functional pattern matching with the full power of Typescript.
</p>

## Getting started

To install from npm:

```
npm install @effect/match
```

Once you have installed the library, you can import the necessary types and functions from the `@effect/match` module.

```ts
import * as Match from "@effect/match"
```

## Defining a Matcher

To define a `Matcher` from a given type, you can use the `type` constructor function.

You can then use the `when`, `not` & `tag` combinators to specify the patterns to match against.

For example:

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const match = pipe(
  Match.type<{ a: number } | { b: string }>(),
  Match.when({ a: Match.number }, (_) => _.a),
  Match.when({ b: Match.string }, (_) => _.b),
  Match.exhaustive,
)

console.log(match({ a: 0 })) // 0
console.log(match({ b: "hello" })) // "hello"
```

You can also create a `Matcher` from a value using the `value` constructor function.

For example:

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const result = pipe(
  Match.value({ name: "John", age: 30 }),
  Match.when(
    { name: "John" },
    (user) => `${user.name} is ${user.age} years old`,
  ),
  Match.orElse(() => "Oh, not John"),
)

console.log(result) // "John is 30 years old"
```

## Types of patterns

### Predicates

Values can be tested against arbitrary functions.

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const match = pipe(
  Match.type<{ age: number }>(),
  Match.when({ age: (age) => age >= 5 }, (user) => `Age: ${user.age}`),
  Match.orElse((user) => `${user.age} is too young`),
)

console.log(match({ age: 5 })) // "Age: 5"
console.log(match({ age: 4 })) // "4 is too young"
```

### `not` patterns

`not` lets you match on everything but a specific value.

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const match = pipe(
  Match.type<string | number>(),
  Match.not("hi", (_) => "a"),
  Match.orElse(() => "b"),
)

console.log(match("hello")) // "a"
console.log(match("hi")) // "b"
```

### `tag` patterns

Matches against the tag in a [Discriminated Union](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)

```ts
import * as Match from "@effect/match"
import * as E from "@effect/data/Either"
import { pipe } from "@effect/data/Function"

// type Either<L, R> = { _tag: "Right", right: R } | { _tag: "Left", left: L }
const match = pipe(
  Match.type<E.Either<string, number>>(),
  Match.tag("Right", (_) => _.right),
  Match.tag("Left", (_) => _.left),
  Match.exhaustive,
)

console.log(match(E.right(123))) // 123
```

## Evaluating a `Matcher`

### `option`

A Matcher that _might_ match a value. Returns an [Option](https://github.com/fp-ts/core/blob/main/guides/Option.md).

```ts
import * as Match from "@effect/match"
import * as E from "@effect/data/Either"
import { pipe } from "@effect/data/Function"

// type Either<L, R> = { _tag: "Right", right: R } | { _tag: "Left", left: L }
// type Option<T> = { _tag: "Some", value: T } | { _tag: "None" }
const result = pipe(
  Match.value(E.right(0)),
  Match.when({ _tag: "Right" }, (_) => _.right),
  Match.option,
)

console.log(result) // { _tag: "Some", value: 0 }
```

### `exhaustive`

A Matcher that marks the end of the matching process and checks if all possible matches were made. Returns the match (for `Match.value`) or the evaluation function (for `Match.type`).

```ts
import * as Match from "@effect/match"
import * as E from "@effect/data/Either"
import { pipe } from "@effect/data/Function"

// type Either<L, R> = { _tag: "Right", right: R } | { _tag: "Left", left: L }
const result = pipe(
  Match.value(E.right(0)),
  Match.when({ _tag: "Right" }, (_) => _.right),
  Match.exhaustive, // TypeError! { _tag: "left", left: never } is not assignable to never
)
```

### `orElse`

A Matcher that marks the end of the matcher and allows to provide a fallback value if no patterns match. Returns the match (for `Match.value`) or the evaluation function (for `Match.type`).

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const match = pipe(
  Match.type<string | number>(),
  Match.when("hi", (_) => "hello"),
  Match.orElse(() => "I literally do not understand"),
)

console.log(match("hello")) // "I literally do not understand"
console.log(match("hi")) // "hello"
```

### `either`

A Matcher that _might_ match a value. Returns an [Either](https://github.com/fp-ts/core/blob/main/guides/Either.md) in the shape of `Either<NoMatchResult, MatchResult>`.

```ts
import * as Match from "@effect/match"
import { pipe } from "@effect/data/Function"

const match = pipe(
  Match.type<string>(),
  Match.when("hi", (_) => "hello"),
  Match.either,
)

// type Either<L, R> = { _tag: "Right", right: R } | { _tag: "Left", left: L }
console.log(match("hi")) // { _tag: "Right", value: "hello" }
console.log(match("shigidigi")) // { _tag: "Left", value: "shigidigi" }
```

## License

The MIT License (MIT)
