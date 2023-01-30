<h3 align="center">
  <img src="./docs/example.png" width="700">
</h3>

<p align="center">
Functional pattern matching with the full power of Typescript.
</p>

## Getting started

To install the **alpha** version:

```
npm install @effect/match
```

Once you have installed the library, you can import the necessary types and functions from the `@effect/match` module.

```ts
import * as Match from "@effect/match"
```

## Defining a Match

To define a `Match`, you can use the provided `type` function to define a new `Match` that matches part of an object of the specified type.

For example, 

```ts
import * as S from "@fp-ts/schema"
import * as Match from "@effect/match"

const match = pipe(
    Match.type<{ a: number } | { b: number }>(),
    Match.when({ a: S.number }, (_) => _.a),
    Match.when({ b: S.number }, (_) => _.b),
    Match.exaustive,
)

console.log(match({ a: 0 })) // 0
```

You can also create a `Match` from a value using the provided `value` function. For example,

```ts
import * as Match from "@effect/match"

const result = pipe(
    Match.value("yeah"),
    Match.when("yeah", (_) => _ === "yeah"),
    Match.when("yeah", (_) => "dupe"),
    Match.orElse(() => "nah"),
)

console.log(result) // "yeah"
```

## Types of matches

### Predicates
Values can be tested against arbitrary functions.

```ts
import * as Match from "@effect/match"

const match = pipe(
    Match.type<{ age: number }>(),
    Match.when({ age: (a) => a >= 5 }, (_) => `Age: ${_.age}`),
    Match.orElse((_) => `${_.age} is too young`),
)

console.log(match({ age: 5 })) // "Age: 5"
```

### `not` matcher
`Match.not` lets you match on everything but a specific value or Schema.

```ts
import * as Match from "@effect/match"

const match = pipe(
    Match.type<string | number>(),
    Match.not("hi", (_) => "a"),
    Match.orElse(() => "b"),
  )

console.log(match("hello")) // "a"
```


## Credits

This library is built upon [@fp-ts/schema](https://github.com/fp-ts/schema).

## License

The MIT License (MIT)
