import * as Data from "@effect/data/Data"
import * as Eq from "@effect/data/Equal"
import * as _ from "@effect/match/ADT"

describe("ADT", () => {
  it("Option", () => {
    type Option<A> = _.ADT<{
      Some: { value: A }
      None: {}
    }>
    interface OptionC extends _.ADT.Constructor {
      adt: Option<this["A"]>
    }
    const Option = _.adt1<OptionC>()

    expect(
      Eq.equals(
        Option("Some")({ value: 1 }),
        Data.struct({
          _tag: "Some",
          value: 1,
        }),
      ),
    ).true
  })
})
