/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"

type Simplify<A> = { [K in keyof A]: A[K] } & {}

/**
 * @category model
 * @since 1.0.0
 */
export type ADT<A extends Record<string, Record<string, any>>> = {
  [K in keyof A]: Data.Data<Simplify<Readonly<A[K]> & { readonly _tag: K }>>
}[keyof A]

/**
 * @since 1.0.0
 */
export namespace ADT {
  type Tag<A extends { _tag: string }> = A["_tag"]

  type Value<A extends { _tag: string }, K extends A["_tag"]> = Omit<
    Extract<A, { _tag: K }>,
    "_tag" | keyof Data.Case
  > extends infer T
    ? {} extends T
      ? void
      : T
    : never

  type Result<A extends { _tag: string }, K extends A["_tag"]> = Extract<
    A,
    { _tag: K }
  >

  /**
   * @category model
   * @since 1.0.0
   */
  export interface Constructor {
    readonly A: unknown
    readonly B: unknown
    readonly C: unknown
    readonly D: unknown
  }

  type Kind<
    F extends Constructor,
    A = unknown,
    B = unknown,
    C = unknown,
    D = unknown,
  > = F extends {
    adt: { _tag: string }
  }
    ? (F & {
        readonly A: A
        readonly B: B
        readonly C: C
        readonly D: D
      })["adt"]
    : never

  /**
   * @category model
   * @since 1.0.0
   */
  export type Constructor1<F extends Constructor> = <K extends Tag<Kind<F>>>(
    tag: K,
  ) => <A>(value: Value<Kind<F, A>, K>) => Result<Kind<F, A>, K>

  /**
   * @category model
   * @since 1.0.0
   */
  export type Constructor2<F extends Constructor> = <K extends Tag<Kind<F>>>(
    tag: K,
  ) => <A, B>(value: Value<Kind<F, A, B>, K>) => Result<Kind<F, A, B>, K>

  /**
   * @category model
   * @since 1.0.0
   */
  export type Constructor3<F extends Constructor> = <K extends Tag<Kind<F>>>(
    tag: K,
  ) => <A, B, C>(
    value: Value<Kind<F, A, B, C>, K>,
  ) => Result<Kind<F, A, B, C>, K>

  /**
   * @category model
   * @since 1.0.0
   */
  export type Constructor4<F extends Constructor> = <K extends Tag<Kind<F>>>(
    tag: K,
  ) => <A, B = unknown, C = unknown, D = unknown>(
    value: Value<Kind<F, A, B, C, D>, K>,
  ) => Result<Kind<F, A, B, C, D>, K>
}

/**
 * @category constructors
 * @since 1.0.0
 */
export function adt<A extends ADT.Constructor>(): ADT.Constructor4<A> {
  return Data.tagged as any
}
/**
 * @category constructors
 * @since 1.0.0
 */
export function adt1<A extends ADT.Constructor>(): ADT.Constructor1<A> {
  return Data.tagged as any
}
/**
 * @category constructors
 * @since 1.0.0
 */
export function adt2<A extends ADT.Constructor>(): ADT.Constructor2<A> {
  return Data.tagged as any
}
/**
 * @category constructors
 * @since 1.0.0
 */
export function adt3<A extends ADT.Constructor>(): ADT.Constructor3<A> {
  return Data.tagged as any
}
