/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"

type Simplify<A> = { [K in keyof A]: A[K] } & {}

/**
 * @since 1.0.0
 */
export namespace TaggedEnum {
  /**
   * @category model
   * @since 1.0.0
   */
  export type Constructor<A extends Record<string, Record<string, any>>> = <
    K extends keyof A,
  >(
    tag: K,
  ) => Data.Case.Constructor<
    Data.Data<
      Simplify<
        Readonly<A[K]> & {
          readonly _tag: K
        }
      >
    >,
    "_tag"
  >

  /**
   * @category model
   * @since 1.0.0
   */
  export type Infer<A extends Constructor<any>> = A extends Constructor<infer T>
    ? {
      [K in keyof T]: Data.Data<
        Simplify<
          Readonly<T[K]> & {
            readonly _tag: K
          }
        >
      >
    }[keyof T]
    : never
}

/**
 * Create a tagged enum data type, which is a union of `Data` structs.
 *
 * ```ts
 * const HttpError = taggedEnum<{
 *   BadRequest: { status: 400, message: string }
 *   NotFound: { status: 404, message: string }
 * }>()
 *
 * const notFound = HttpError("NotFound")({ status: 404, message: "Not Found" })
 * ```
 *
 * @category constructors
 * @since 1.0.0
 */
export function taggedEnum<
  A extends Record<string, Record<string, any>>,
>(): TaggedEnum.Constructor<A> {
  return Data.tagged as any
}
