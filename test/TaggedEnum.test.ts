import * as Data from "@effect/data/Data"
import * as Eq from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as M from "@effect/match"
import type { TaggedEnum } from "@effect/match/TaggedEnum"
import { taggedEnum } from "@effect/match/TaggedEnum"

const HttpError = taggedEnum<{
  BadRequest: { status: 400; message: string }
  NotFound: { status: 404; message: string }
}>()
type HttpError = TaggedEnum.Infer<typeof HttpError>

describe("TaggedEnum", () => {
  it("equals", () => {
    expect(
      Eq.equals(
        HttpError("BadRequest")({ status: 400, message: "Bad Request" }),
        Data.struct({
          _tag: "BadRequest",
          status: 400,
          message: "Bad Request",
        }),
      ),
    ).true
  })

  it("match", () => {
    const match = pipe(
      M.type<HttpError>(),
      M.tag("BadRequest", (_) => "match"),
      M.orElse(() => "no match"),
    )

    expect(
      match(HttpError("BadRequest")({ status: 400, message: "Bad Request" })),
    ).eq("match")
  })

  it("valueTags", () => {
    const error = HttpError("BadRequest")({
      status: 400,
      message: "Bad Request",
    }) as HttpError
    const match = pipe(
      error,
      M.valueTags({
        BadRequest: (_) => "match",
        NotFound: (_) => false,
      }),
    )

    expect(match).eq("match")
  })
})
