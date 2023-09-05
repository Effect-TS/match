/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 */
export const SafeRefinementId = Symbol.for("@effect/match/SafeRefinement")

/**
 * @since 1.0.0
 */
export type SafeRefinementId = typeof SafeRefinementId

/**
 * @category model
 * @since 1.0.0
 */
export interface SafeRefinement<A, R = A> {
  readonly [SafeRefinementId]: (a: A) => R
}
