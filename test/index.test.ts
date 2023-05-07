import * as E from "@effect/data/Either"
import { pipe } from "@effect/data/Function"
import * as O from "@effect/data/Option"
import * as Predicate from "@effect/data/Predicate"
import * as M from "@effect/match"
import { typeEquals } from "@effect/match/test/utils/typeEquals"
import * as S from "@effect/schema/Schema"

describe("Matcher", () => {
  it("exhaustive", () => {
    const match = pipe(
      M.type<{ a: number } | { b: number }>(),
      M.when({ a: M.number }, (_) => _.a),
      M.when({ b: M.number }, (_) => _.b),
      M.exhaustive,
    )
    expect(match({ a: 0 })).toBe(0)
    expect(match({ b: 1 })).toBe(1)
  })

  it("exhaustive-literal", () => {
    const match = pipe(
      M.type<{ _tag: "A"; a: number } | { _tag: "B"; b: number }>(),
      M.when({ _tag: "A" }, (_) => E.right(_.a)),
      M.when({ _tag: "B" }, (_) => E.right(_.b)),
      M.exhaustive,
    )
    expect(match({ _tag: "A", a: 0 })).toEqual(E.right(0))
    expect(match({ _tag: "B", b: 1 })).toEqual(E.right(1))
  })

  it("schema exhaustive-literal", () => {
    const match = pipe(
      M.type<{ _tag: "A"; a: number | string } | { _tag: "B"; b: number }>(),
      M.when({ _tag: M.is("A", "B"), a: M.number }, (_) => {
        typeEquals(_)<{ _tag: "A"; a: number }>() satisfies true
        return E.right(_._tag)
      }),
      M.when({ _tag: M.string, a: M.string }, (_) => {
        typeEquals(_)<{ _tag: "A"; a: string }>() satisfies true
        return E.right(_._tag)
      }),
      M.when({ b: M.number }, (_) => E.left(_._tag)),
      M.orElse((_) => {
        throw "absurd"
      }),
    )
    expect(match({ _tag: "A", a: 0 })).toEqual(E.right("A"))
    expect(match({ _tag: "A", a: "hi" })).toEqual(E.right("A"))
    expect(match({ _tag: "B", b: 1 })).toEqual(E.left("B"))
  })

  it("exhaustive literal with not", () => {
    const match = pipe(
      M.type<number>(),
      M.when(1, (_) => true),
      M.not(1, (_) => false),
      M.exhaustive,
    )
    expect(match(1)).toEqual(true)
    expect(match(2)).toEqual(false)
  })

  it("inline", () => {
    const result = pipe(
      M.value(E.right(0)),
      M.tag("Right", (_) => _.right),
      M.tag("Left", (_) => _.left),
      M.exhaustive,
    )
    expect(result).toEqual(0)
  })

  it("piped", () => {
    const result = pipe(
      E.right(0),
      M.value,
      M.when({ _tag: "Right" }, (_) => _.right),
      M.option,
    )
    expect(result).toEqual(O.some(0))
  })

  it("tuples", () => {
    const match = pipe(
      M.type<[string, string]>(),
      M.when(["yeah", M.string], (_) => {
        typeEquals(_)<readonly ["yeah", string]>() satisfies true
        return true
      }),
      M.option,
    )

    expect(match(["yeah", "a"])).toEqual(O.some(true))
  })

  it("literals", () => {
    const match = pipe(
      M.type<string>(),
      M.when("yeah", (_) => _ === "yeah"),
      M.orElse(() => "nah"),
    )

    expect(match("yeah")).toEqual(true)
    expect(match("a")).toEqual("nah")
  })

  it("piped", () => {
    const result = pipe(
      E.right(0),
      M.value,
      M.when({ _tag: "Right" }, (_) => _.right),
      M.option,
    )
    expect(result).toEqual(O.some(0))
  })

  it("not schema", () => {
    const match = pipe(
      M.type<string | number>(),
      M.not(M.number, (_) => "a"),
      M.when(M.number, (_) => "b"),
      M.exhaustive,
    )
    expect(match("hi")).toEqual("a")
    expect(match(123)).toEqual("b")
  })

  it("not literal", () => {
    const match = pipe(
      M.type<string | number>(),
      M.not("hi", (_) => {
        typeEquals(_)<string | number>() satisfies true
        return "a"
      }),
      M.orElse((_) => "b"),
    )
    expect(match("hello")).toEqual("a")
    expect(match("hi")).toEqual("b")
  })

  it("tuples", () => {
    const match = pipe(
      M.type<[string, string]>(),
      M.when(["yeah", M.string], (_) => {
        typeEquals(_)<readonly ["yeah", string]>() satisfies true
        return true
      }),
      M.option,
    )

    expect(match(["yeah", "a"])).toEqual(O.some(true))
  })

  it("literals", () => {
    const match = pipe(
      M.type<string>(),
      M.when("yeah", (_) => {
        typeEquals(_)<"yeah">() satisfies true
        return _ === "yeah"
      }),
      M.orElse(() => "nah"),
    )

    expect(match("yeah")).toEqual(true)
    expect(match("a")).toEqual("nah")
  })

  it("literals duplicate", () => {
    const result = pipe(
      M.value("yeah"),
      M.when("yeah", (_) => _ === "yeah"),
      M.when("yeah", (_) => "dupe"),
      M.orElse((_) => "nah"),
    )

    expect(result).toEqual(true)
  })

  it("discriminator", () => {
    const match = pipe(
      M.type<{ type: "A" } | { type: "B" }>(),
      M.discriminator("type")("A", (_) => _.type),
      M.discriminator("type")("B", (_) => _.type),
      M.exhaustive,
    )
    expect(match({ type: "B" })).toEqual("B")
  })

  it("discriminator multiple", () => {
    const result = pipe(
      M.value(E.right(0)),
      M.discriminator("_tag")("Right", "Left", (_) => "match"),
      M.exhaustive,
    )
    expect(result).toEqual("match")
  })

  it("nested", () => {
    const match = pipe(
      M.type<
        | { foo: { bar: { baz: { qux: string } } } }
        | { foo: { bar: { baz: { qux: number } } } }
        | { foo: { bar: null } }
      >(),
      M.when({ foo: { bar: { baz: { qux: 2 } } } }, (_) => {
        typeEquals(_)<{ foo: { bar: { baz: { qux: 2 } } } }>() satisfies true
        return `literal ${_.foo.bar.baz.qux}`
      }),
      M.when({ foo: { bar: { baz: { qux: "b" } } } }, (_) => {
        typeEquals(_)<{ foo: { bar: { baz: { qux: "b" } } } }>() satisfies true
        return `literal ${_.foo.bar.baz.qux}`
      }),
      M.when(
        { foo: { bar: { baz: { qux: M.number } } } },
        (_) => _.foo.bar.baz.qux,
      ),
      M.when(
        { foo: { bar: { baz: { qux: M.safe(S.string) } } } },
        (_) => _.foo.bar.baz.qux,
      ),
      M.when({ foo: { bar: null } }, (_) => _.foo.bar),
      M.exhaustive,
    )

    expect(match({ foo: { bar: { baz: { qux: 1 } } } })).toEqual(1)
    expect(match({ foo: { bar: { baz: { qux: 2 } } } })).toEqual("literal 2")
    expect(match({ foo: { bar: { baz: { qux: "a" } } } })).toEqual("a")
    expect(match({ foo: { bar: { baz: { qux: "b" } } } })).toEqual("literal b")
    expect(match({ foo: { bar: null } })).toEqual(null)
  })

  it("nested Option", () => {
    const match = pipe(
      M.type<{ user: O.Option<{ readonly name: string }> }>(),
      M.when({ user: { _tag: "Some" } }, (_) => _.user.value.name),
      M.orElse((_) => "fail"),
    )

    expect(match({ user: O.some({ name: "a" }) })).toEqual("a")
    expect(match({ user: O.none() })).toEqual("fail")
  })

  it("predicate", () => {
    const match = pipe(
      M.type<{ age: number }>(),
      M.when({ age: (a) => a >= 5 }, (_) => `Age: ${_.age}`),
      M.orElse((_) => `${_.age} is too young`),
    )

    expect(match({ age: 5 })).toEqual("Age: 5")
    expect(match({ age: 4 })).toEqual("4 is too young")
  })

  it("predicate not", () => {
    const match = pipe(
      M.type<{ age: number }>(),
      M.not({ age: (a) => a >= 5 }, (_) => `Age: ${_.age}`),
      M.orElse((_) => `${_.age} is too old`),
    )

    expect(match({ age: 4 })).toEqual("Age: 4")
    expect(match({ age: 5 })).toEqual("5 is too old")
  })

  it("predicate with functions", () => {
    const match = pipe(
      M.type<{
        a: number
        b: {
          c: string
          f?: (status: number) => Promise<string>
        }
      }>(),
      M.when({ a: 400 }, (_) => "400"),
      M.when({ b: (b) => b.c === "nested" }, (_) => _.b.c),
      M.orElse(() => "fail"),
    )

    expect(match({ b: { c: "nested" }, a: 200 })).toEqual("nested")
    expect(match({ b: { c: "nested" }, a: 400 })).toEqual("400")
  })

  it("predicate at root level", () => {
    const match = pipe(
      M.type<{
        a: number
        b: {
          c: string
          f?: (status: number) => Promise<string>
        }
      }>(),
      M.when(
        (_) => _.a === 400,
        (_) => "400",
      ),
      M.when({ b: (b) => b.c === "nested" }, (_) => _.b.c),
      M.orElse(() => "fail"),
    )

    expect(match({ b: { c: "nested" }, a: 200 })).toEqual("nested")
    expect(match({ b: { c: "nested" }, a: 400 })).toEqual("400")
  })

  it("symbols", () => {
    const thing = {
      symbol: Symbol(),
      name: "thing",
    } as const

    const match = pipe(
      M.value(thing),
      M.when({ name: "thing" }, (_) => _.name),
      M.exhaustive,
    )

    expect(match).toEqual("thing")
  })

  it("unify", () => {
    const match = pipe(
      M.type<{ readonly _tag: "A" } | { readonly _tag: "B" }>(),
      M.tag("A", () => E.right("a") as E.Either<number, string>),
      M.tag("B", () => E.right(123) as E.Either<string, number>),
      M.exhaustive,
    )

    expect(match({ _tag: "B" })).toEqual(E.right(123))
  })

  it("optional props", () => {
    const match = pipe(
      M.type<{ readonly user?: { readonly name: string } }>(),
      M.when({ user: M.any }, (_) => _.user.name),
      M.orElse(() => "no user"),
    )

    expect(match({})).toEqual("no user")
    expect(match({ user: { name: "Tim" } })).toEqual("Tim")
  })

  it("deep recursive", () => {
    type A =
      | null
      | Uint8Array
      | string
      | number
      | B
      | { [K in string]: A }
      | Set<Uint8Array>
      | Set<string>
      | Set<number>
    type B = Array<A>

    const match = pipe(
      M.type<A>(),
      M.when(Predicate.isNull, (_) => {
        typeEquals(_)<null>() satisfies true
        return "null"
      }),
      M.when(Predicate.isBoolean, (_) => {
        typeEquals(_)<never>() satisfies true
        return "boolean"
      }),
      M.when(Predicate.isNumber, (_) => {
        typeEquals(_)<number>() satisfies true
        return "number"
      }),
      M.when(Predicate.isString, (_) => {
        typeEquals(_)<string>() satisfies true
        return "string"
      }),
      M.when(M.record, (_) => {
        typeEquals(_)<
          | Record<string, A>
          | Uint8Array
          | Set<Uint8Array>
          | Set<string>
          | Set<number>
        >() satisfies true
        return "record"
      }),
      M.when(Predicate.isSymbol, (_) => {
        typeEquals(_)<never>() satisfies true
        return "symbol"
      }),
      M.when(Predicate.isReadonlyRecord, (_) => {
        typeEquals(_)<never>() satisfies true
        return "readonlyrecord"
      }),
      M.exhaustive,
    )

    expect(match(null)).toEqual("null")
    expect(match(123)).toEqual("number")
    expect(match("hi")).toEqual("string")
    expect(match({})).toEqual("record")
    expect(match(new Uint8Array())).toEqual("record")
    expect(match(new Set<string>())).toEqual("record")
  })

  it("nested option", () => {
    type ABC =
      | { readonly _tag: "A" }
      | { readonly _tag: "B" }
      | { readonly _tag: "C" }

    const match = pipe(
      M.type<{ readonly abc: O.Option<ABC> }>(),
      M.when({ abc: { value: { _tag: "A" } } }, (_) => _.abc.value._tag),
      M.orElse((_) => "no match"),
    )

    expect(match({ abc: O.some({ _tag: "A" }) })).toEqual("A")
    expect(match({ abc: O.some({ _tag: "B" }) })).toEqual("no match")
    expect(match({ abc: O.none() })).toEqual("no match")
  })

  it("getters", () => {
    class Thing {
      get name() {
        return "thing"
      }
    }

    const match = pipe(
      M.value(new Thing()),
      M.when({ name: "thing" }, (_) => _.name),
      M.orElse(() => "fail"),
    )

    expect(match).toEqual("thing")
  })
})
