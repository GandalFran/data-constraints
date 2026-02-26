const { FormatConstraint, UniqueConstraint } = require("../../src/constraints");

describe("FormatConstraint", () => {
  test("should validate regex match", async () => {
    const constraint = new FormatConstraint("email")
      .setField("email")
      .setRegex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    const valid = { email: "test@example.com" };
    expect(await constraint.validate({ record: valid })).toBeNull();

    const invalid = { email: "invalid-email" };
    const error = await constraint.validate({ record: invalid });
    expect(error).not.toBeNull();
    expect(error.id).toBe("email");
    expect(error.message).toContain("does not match format");
  });

  test("should skip undefined and null values", async () => {
    const constraint = new FormatConstraint("email")
      .setField("email")
      .setRegex(".");
    expect(await constraint.validate({ record: {} })).toBeNull();
    expect(await constraint.validate({ record: { email: null } })).toBeNull();
  });

  test("should validate array values", async () => {
    const constraint = new FormatConstraint("tags")
      .setField("tags")
      .setRegex("^[a-z]+$");
    expect(
      await constraint.validate({ record: { tags: ["tagone", "tagtwo"] } }),
    ).toBeNull();
    const error = await constraint.validate({
      record: { tags: ["tag1", "tagtwo"] },
    });
    expect(error).not.toBeNull();
    expect(error.message).toContain("does not match format");
  });
});

describe("UniqueConstraint", () => {
  test("should detect duplicates", async () => {
    const constraint = new UniqueConstraint("unique-id").setField("id");

    const record1 = { id: 1 };
    expect(await constraint.validate({ record: record1 })).toBeNull();

    const record2 = { id: 2 };
    expect(await constraint.validate({ record: record2 })).toBeNull();

    const record3 = { id: 1 }; // Duplicate
    const error = await constraint.validate({ record: record3 });
    expect(error).not.toBeNull();
    expect(error.message).toContain("Duplicate value");
  });

  test("should skip undefined and null values", async () => {
    const constraint = new UniqueConstraint("id").setField("id");
    expect(await constraint.validate({ record: {} })).toBeNull();
    expect(await constraint.validate({ record: { id: null } })).toBeNull();
  });

  test("should validate array values for duplicates", async () => {
    const constraint = new UniqueConstraint("tags").setField("tags");
    expect(
      await constraint.validate({ record: { tags: ["apple", "banana"] } }),
    ).toBeNull();
    const error = await constraint.validate({
      record: { tags: ["cherry", "apple"] },
    });
    expect(error).not.toBeNull();
    expect(error.message).toContain("Duplicate value");
  });
});

const { ForeignKeyConstraint } = require("../../src/constraints");

describe("ForeignKeyConstraint", () => {
  let mockReferenceData;

  beforeEach(() => {
    mockReferenceData = [
      { id: 1, name: "Active User", isActive: true },
      { id: 2, name: "Inactive User", isActive: false },
    ];
  });

  // Helper to generate AsyncIterable
  async function* getIterable(data) {
    for (const item of data) {
      yield item;
    }
  }

  test("should validate simple foreign key", async () => {
    const constraint = new ForeignKeyConstraint("fk-test")
      .setService("orders")
      .setReferenceService("users")
      .setReferenceField("id")
      .setField("userId");

    await constraint.buildIndex(getIterable(mockReferenceData));

    const validRecord = { userId: 1 };
    expect(await constraint.validate({ record: validRecord })).toBeNull();

    const invalidRecord = { userId: 99 };
    const error = await constraint.validate({ record: invalidRecord });
    expect(error).not.toBeNull();
    expect(error.id).toBe("fk-test");
  });

  test("should validate advanced foreign key with multiple variables and target query", async () => {
    const constraint = new ForeignKeyConstraint("fk-advanced")
      .setService("orders")
      .setReferenceService("users")
      .setVariables({ uid: "metadata.userId" })
      .setTarget({
        $and: [{ id: { $eq: "{{uid}}" } }, { isActive: { $eq: true } }],
      });

    await constraint.buildIndex(getIterable(mockReferenceData));

    // Refers to active user
    const validRecord = { metadata: { userId: 1 } };
    expect(await constraint.validate({ record: validRecord })).toBeNull();

    // Refers to inactive user
    const invalidRecord = { metadata: { userId: 2 } };
    const error = await constraint.validate({ record: invalidRecord });
    expect(error).not.toBeNull();
    expect(error.id).toBe("fk-advanced");
  });
});
