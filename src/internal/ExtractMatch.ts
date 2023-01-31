export type ExtractMatch<A, E> = Extract<A, ExpandTuples<E>> extends never
  ? ExtractPrecise<A, E> extends never
    ? Replace<Extract<A, MaybeReplaceLiterals<A, ExpandTuples<E>>>, E>
    : ExtractPrecise<A, E>
  : Replace<Extract<A, ExpandTuples<E>>, E>

// Adapted from https://github.com/gvergnaud/ts-pattern under the MIT licence.
// Thanks!
type ExtractPrecise<I, P> = unknown extends P
  ? I
  : IsAny<I> extends true
  ? P
  : P extends readonly []
  ? []
  : IsPlainObject<P, BuiltInObjects | Error> extends true
  ? I extends object
    ? I extends P
      ? I
      : P extends I
      ? P
      : [keyof I & keyof P] extends [never]
      ? never
      : ExcludeObjectIfContainsNever<
          Compute<
            {
              [k in Exclude<keyof I, keyof P>]: I[k]
            } & {
              [k in keyof P]: k extends keyof I
                ? ExtractPrecise<I[k], P[k]>
                : P[k]
            }
          >,
          keyof P & string
        >
    : LeastUpperBound<I, P>
  : LeastUpperBound<I, P>

type ExpandTuples<A> = A extends Array<infer I>
  ? Array<I> | A
  : A extends Record<string, any>
  ? { [K in keyof A]: ExpandTuples<A[K]> }
  : A

type Replace<A, B> = A extends Record<string | number, any>
  ? { [K in keyof A]: K extends keyof B ? Replace<A[K], B[K]> : A[K] }
  : B extends A
  ? B
  : A

type MaybeReplaceLiterals<A, B> = B extends Record<string, any>
  ? {
      [K in keyof B]: K extends keyof A
        ? MaybeReplaceLiterals<A[K], B[K]>
        : B[K]
    }
  : B extends A
  ? A
  : B

type ValueOf<a> = a extends Array<any> ? a[number] : a[keyof a]

type Values<a extends object> = UnionToTuple<ValueOf<a>>

type LeastUpperBound<a, b> = b extends a ? b : a extends b ? a : never

type ExcludeObjectIfContainsNever<a, keyConstraint = unknown> = a extends any
  ? "exclude" extends {
      [k in keyConstraint & keyof a]-?: [a[k]] extends [never]
        ? "exclude"
        : "include"
    }[keyConstraint & keyof a]
    ? never
    : a
  : never

// from https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
type UnionToIntersection<union> = (
  union extends any ? (k: union) => void : never
) extends (k: infer intersection) => void
  ? intersection
  : never

type IsUnion<a> = [a] extends [UnionToIntersection<a>] ? false : true

type UnionToTuple<union, output extends Array<any> = []> = UnionToIntersection<
  union extends any ? (t: union) => union : never
> extends (_: any) => infer elem
  ? UnionToTuple<Exclude<union, elem>, [elem, ...output]>
  : output

type Cast<a, b> = a extends b ? a : never

type Flatten<
  xs extends Array<any>,
  output extends Array<any> = [],
> = xs extends readonly [infer head, ...infer tail]
  ? Flatten<tail, [...output, ...Cast<head, Array<any>>]>
  : output

type IsAny<a> = 0 extends 1 & a ? true : false

type Length<it extends ReadonlyArray<any>> = it["length"]

type BuiltInObjects =
  | Function
  | Date
  | RegExp
  | Generator
  | { readonly [Symbol.toStringTag]: string }
  | Array<any>

type IsPlainObject<o, excludeUnion = BuiltInObjects> = o extends object
  ? // to excluded branded string types,
    // like `string & { __brand: "id" }`
    // and built-in objects
    o extends string | excludeUnion
    ? false
    : true
  : false

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
type Compute<a extends any> = a extends BuiltInObjects
  ? a
  : { [k in keyof a]: a[k] }

type Primitives = number | boolean | string | undefined | null | symbol | bigint

type IsMatching<a, p> = true extends IsUnion<a> | IsUnion<p>
  ? true extends (
      p extends any ? (a extends any ? IsMatching<a, p> : never) : never
    )
    ? true
    : false
  : // Special case for unknown, because this is the type
  // of the inverted `_` wildcard pattern, which should
  // match everything.
  unknown extends p
  ? true
  : p extends Primitives
  ? p extends a
    ? true
    : false
  : [p, a] extends [ReadonlyArray<any>, ReadonlyArray<any>]
  ? [p, a] extends [
      readonly [infer p1, infer p2, infer p3, infer p4, infer p5],
      readonly [infer a1, infer a2, infer a3, infer a4, infer a5],
    ]
    ? [
        IsMatching<a1, p1>,
        IsMatching<a2, p2>,
        IsMatching<a3, p3>,
        IsMatching<a4, p4>,
        IsMatching<a5, p5>,
      ] extends [true, true, true, true, true]
      ? true
      : false
    : [p, a] extends [
        readonly [infer p1, infer p2, infer p3, infer p4],
        readonly [infer a1, infer a2, infer a3, infer a4],
      ]
    ? [
        IsMatching<a1, p1>,
        IsMatching<a2, p2>,
        IsMatching<a3, p3>,
        IsMatching<a4, p4>,
      ] extends [true, true, true, true]
      ? true
      : false
    : [p, a] extends [
        readonly [infer p1, infer p2, infer p3],
        readonly [infer a1, infer a2, infer a3],
      ]
    ? [IsMatching<a1, p1>, IsMatching<a2, p2>, IsMatching<a3, p3>] extends [
        true,
        true,
        true,
      ]
      ? true
      : false
    : [p, a] extends [
        readonly [infer p1, infer p2],
        readonly [infer a1, infer a2],
      ]
    ? [IsMatching<a1, p1>, IsMatching<a2, p2>] extends [true, true]
      ? true
      : false
    : [p, a] extends [readonly [infer p1], readonly [infer a1]]
    ? IsMatching<a1, p1>
    : p extends a
    ? true
    : false
  : IsPlainObject<p> extends true
  ? true extends ( // `true extends union` means "if some cases of the a union are matching"
      a extends any // loop over the `a` union
        ? [keyof p & keyof a] extends [never] // if no common keys
          ? false
          : /**
           * Intentionally not using ValueOf, to avoid reaching the
           * 'type instanciation is too deep error'.
           */
          { [k in keyof p & keyof a]: IsMatching<a[k], p[k]> }[keyof p &
              keyof a] extends true
          ? true // all values are matching
          : false
        : never
    )
    ? true
    : false
  : p extends a
  ? true
  : false

// FindUnionsMany :: a -> Union<a> -> PropertyKey[] -> UnionConfig[]
type FindUnionsMany<a, p, path extends Array<PropertyKey> = []> = UnionToTuple<
  (
    p extends any
      ? IsMatching<a, p> extends true
        ? FindUnions<a, p, path>
        : []
      : never
  ) extends Array<infer T>
    ? T
    : never
>

type FindUnions<A, P, Path extends Array<PropertyKey> = []> = unknown extends P
  ? []
  : IsAny<P> extends true
  ? [] // Don't try to find unions after 5 levels
  : Length<Path> extends 5
  ? []
  : IsUnion<A> extends true
  ? [
      {
        cases: A extends any
          ? {
              value: A
              subUnions: FindUnionsMany<A, P, Path>
            }
          : never
        path: Path
      },
    ]
  : [A, P] extends [ReadonlyArray<any>, ReadonlyArray<any>]
  ? [A, P] extends [
      readonly [infer a1, infer a2, infer a3, infer a4, infer a5],
      readonly [infer p1, infer p2, infer p3, infer p4, infer p5],
    ]
    ? [
        ...FindUnions<a1, p1, [...Path, 0]>,
        ...FindUnions<a2, p2, [...Path, 1]>,
        ...FindUnions<a3, p3, [...Path, 2]>,
        ...FindUnions<a4, p4, [...Path, 3]>,
        ...FindUnions<a5, p5, [...Path, 4]>,
      ]
    : [A, P] extends [
        readonly [infer a1, infer a2, infer a3, infer a4],
        readonly [infer p1, infer p2, infer p3, infer p4],
      ]
    ? [
        ...FindUnions<a1, p1, [...Path, 0]>,
        ...FindUnions<a2, p2, [...Path, 1]>,
        ...FindUnions<a3, p3, [...Path, 2]>,
        ...FindUnions<a4, p4, [...Path, 3]>,
      ]
    : [A, P] extends [
        readonly [infer a1, infer a2, infer a3],
        readonly [infer p1, infer p2, infer p3],
      ]
    ? [
        ...FindUnions<a1, p1, [...Path, 0]>,
        ...FindUnions<a2, p2, [...Path, 1]>,
        ...FindUnions<a3, p3, [...Path, 2]>,
      ]
    : [A, P] extends [
        readonly [infer a1, infer a2],
        readonly [infer p1, infer p2],
      ]
    ? [...FindUnions<a1, p1, [...Path, 0]>, ...FindUnions<a2, p2, [...Path, 1]>]
    : [A, P] extends [readonly [infer a1], readonly [infer p1]]
    ? FindUnions<a1, p1, [...Path, 0]>
    : []
  : A extends Set<any>
  ? []
  : A extends Map<any, any>
  ? []
  : [IsPlainObject<A>, IsPlainObject<P>] extends [true, true]
  ? Flatten<
      Values<{
        [k in keyof A & keyof P]: FindUnions<A[k], P[k], [...Path, k]>
      }>
    >
  : []
