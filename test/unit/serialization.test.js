const {
  FormatConstraint,
  UniqueConstraint,
  ForeignKeyConstraint,
} = require("../../src/constraints");
const ConstraintBase = require("../../src/constraints/base");

describe("Constraint Serialization", () => {
  test("ConstraintBase validate should throw", async () => {
    const c = new ConstraintBase("base", "b1");
    await expect(c.validate({})).rejects.toThrow();
  });

  test("ConstraintBase fromJSON should throw", () => {
    expect(() => ConstraintBase.fromJSON({})).toThrow();
  });

  test("FormatConstraint serialization", () => {
    const original = new FormatConstraint("f1").setRegex("^abc$").setField("f");
    const json = original.toJSON();
    const copy = FormatConstraint.fromJSON(json);
    expect(copy).toBeInstanceOf(FormatConstraint);
    expect(copy.id).toBe("f1");
    expect(copy.regex.source).toBe("^abc$");
  });

  test("UniqueConstraint serialization", () => {
    const original = new UniqueConstraint("u1").setField("id");
    const json = original.toJSON();
    const copy = UniqueConstraint.fromJSON(json);
    expect(copy).toBeInstanceOf(UniqueConstraint);
    expect(copy.id).toBe("u1");
  });

  test("ForeignKeyConstraint serialization", () => {
    const original = new ForeignKeyConstraint("fk1")
      .setReferenceService("s2")
      .setReferenceField("id")
      .setField("fk");
    const json = original.toJSON();
    const copy = ForeignKeyConstraint.fromJSON(json);
    expect(copy).toBeInstanceOf(ForeignKeyConstraint);
    expect(copy.referenceService).toBe("s2");
  });

  test("ForeignKeyConstraint validation checks", async () => {
    const fk = new ForeignKeyConstraint("fk1").setField("fk");
    await expect(fk.validate({})).rejects.toThrow(
      'Index for FK constraint "fk1" not built',
    );

    fk.isIndexBuilt = true;
    fk.index = new Map();

    // Null value should be ignored
    expect(await fk.validate({ record: { fk: null } })).toBeNull();
  });
});
