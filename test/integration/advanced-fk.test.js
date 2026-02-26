const DataEngine = require("../../src/core/engine");
const DataSource = require("../../src/core/data-source");
const JsonLoader = require("../../src/loaders/json-loader");
require("../../src/constraints"); // Ensure constraints are registered
const ConstraintRegistry = require("../../src/core/registry");

describe("Advanced ForeignKey Constraint", () => {
  let engine;
  let reporter;

  class MockReporter {
    constructor() {
      this.issues = [];
      this.errors = [];
    }
    report(issue) {
      this.issues.push(issue);
    }
    error(err, _context) {
      this.errors.push(err);
      // console.error('Test Error:', err);
    }
    finish() {}
  }

  beforeEach(() => {
    engine = new DataEngine();
    reporter = new MockReporter();
  });

  test("should validate complex array correlation using variables and target", async () => {
    const productsData = [
      { id: "p1", supplierId: "s1", region: "US" },
      { id: "p2", supplierId: "s2", region: "EU" },
      { id: "p3", supplierId: "s1", region: "EU" },
    ];

    const ordersData = [
      {
        id: "o1",
        items: [
          { pid: "p1", sid: "s1" },
          { pid: "p2", sid: "s2" },
        ],
      },
      {
        id: "o2",
        items: [
          { pid: "p1", sid: "s2" }, // INVALID! p1 is s1.
        ],
      },
    ];

    engine.addSource("products", DataSource.memory(productsData), JsonLoader);
    engine.addSource("orders", DataSource.memory(ordersData), JsonLoader);

    const constraintConfig = {
      type: "foreign-key",
      id: "valid-product-supplier",
      service: "orders",
      referenceService: "products",
      variables: {
        v_pid: "items.pid",
        v_sid: "items.sid",
      },
      target: {
        $and: [
          { id: { $eq: "{{v_pid}}" } },
          { supplierId: { $eq: "{{v_sid}}" } },
        ],
      },
      message:
        "Item correlation invalid: Product {{v_pid}} is not supplied by {{v_sid}}",
    };

    engine.addConstraint(ConstraintRegistry.create(constraintConfig));

    await engine.run(reporter);

    // Assertions
    if (reporter.errors.length > 0) {
      console.error("Errors found:", reporter.errors);
    }
    expect(reporter.errors).toHaveLength(0);

    const issues = reporter.issues.filter(
      (r) => r.id === "valid-product-supplier",
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].record.id).toBe("o2");
    expect(issues[0].context.variables.v_pid).toBe("p1");
    expect(issues[0].context.variables.v_sid).toBe("s2");
  });

  test("should validate nested correlations", async () => {
    const users = [
      {
        id: "u1",
        identities: [
          { types: ["email"], val: "a@a.com" },
          { types: ["phone"], val: "123" },
        ],
      },
    ];

    const transactions = [
      { uid: "u1", identityVal: "a@a.com" }, // Valid
      { uid: "u1", identityVal: "999" }, // Invalid
    ];

    engine.addSource("users", DataSource.memory(users), JsonLoader);
    engine.addSource("tx", DataSource.memory(transactions), JsonLoader);

    const constraint = {
      type: "foreign-key",
      id: "check-identity",
      service: "tx",
      referenceService: "users",
      variables: {
        u: "uid",
        i: "identityVal",
      },
      target: {
        // Check if user has ID=u AND has an identity with val=i
        // "identities": array of objects.
        // "identities.val": virtual array of values in Loki?
        // { "identities.val": { "$eq": "{{i}}" } }
        $and: [
          { id: { $eq: "{{u}}" } },
          { "identities.val": { $eq: "{{i}}" } },
        ],
      },
    };

    engine.addConstraint(ConstraintRegistry.create(constraint));

    await engine.run(reporter);

    expect(reporter.errors).toHaveLength(0);

    const issues = reporter.issues.filter((r) => r.id === "check-identity");
    expect(issues).toHaveLength(1);
    expect(issues[0].record.identityVal).toBe("999");
  });
});
