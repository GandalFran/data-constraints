const DataEngine = require("../../src/core/engine");
const DataSource = require("../../src/core/data-source");
const JsonLoader = require("../../src/loaders/json-loader");
const {
  FormatConstraint,
  UniqueConstraint,
  ForeignKeyConstraint,
} = require("../../src/constraints");
const logger = require("../../src/utils/logger");

// Disable logs during test
logger.setEnabled(false);

class MockReporter {
  constructor() {
    this.issues = [];
    this.errors = [];
  }
  report(issue) {
    this.issues.push(issue);
  }
  error(err) {
    this.errors.push(err);
  }
  finish() {}
}

describe("Complex Integration Scenarios", () => {
  let engine;
  let reporter;

  beforeEach(() => {
    engine = new DataEngine({});
    reporter = new MockReporter();
  });

  test("should validate Users, Products, and Orders with multiple constraints", async () => {
    // 1. Data Setup
    const users = [
      { id: "u1", email: "alice@example.com", role: "admin" },
      { id: "u2", email: "bob@example.com", role: "user" },
      { id: "u3", email: "invalid-email", role: "user" }, // Format fail
      { id: "u1", email: "duplicate@example.com", role: "guest" }, // Unique fail (duplicate ID)
    ];

    const products = [
      { sku: "PROD-001", price: 100 },
      { sku: "PROD-002", price: 200 },
      { sku: "invalid-sku", price: 50 }, // Format fail
    ];

    const orders = [
      { id: "o1", userId: "u1", productSku: "PROD-001" },
      { id: "o2", userId: "u2", productSku: "PROD-002" },
      { id: "o3", userId: "u99", productSku: "PROD-001" }, // FK fail (user u99 not found)
      { id: "o4", userId: "u1", productSku: "PROD-999" }, // FK fail (product PROD-999 not found)
    ];

    // 2. Add Sources
    engine.addSource("users", DataSource.memory(users), JsonLoader);
    engine.addSource("products", DataSource.memory(products), JsonLoader);
    engine.addSource("orders", DataSource.memory(orders), JsonLoader);

    // 3. Add Constraints

    // User Constraints
    engine.addConstraint(
      new UniqueConstraint("unique-user-id").setField("id").setService("users"),
    );
    engine.addConstraint(
      new FormatConstraint("email-format")
        .setField("email")
        .setRegex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")
        .setService("users"),
    );

    // Product Constraints
    engine.addConstraint(
      new FormatConstraint("sku-format")
        .setField("sku")
        .setRegex("^[A-Z]{4}-\\d{3}$")
        .setService("products"),
    );

    // Order Constraints
    engine.addConstraint(
      new UniqueConstraint("unique-order-id")
        .setField("id")
        .setService("orders"),
    );

    // Order FKs
    engine.addConstraint(
      new ForeignKeyConstraint("fk-order-user")
        .setField("userId")
        .setService("orders")
        .setReferenceService("users")
        .setReferenceField("id"),
    );

    engine.addConstraint(
      new ForeignKeyConstraint("fk-order-product")
        .setField("productSku")
        .setService("orders")
        .setReferenceService("products")
        .setReferenceField("sku"),
    );

    // 4. Run Validation
    await engine.run(reporter);

    // 5. Assertions

    const issues = reporter.issues;
    expect(issues.length).toBeGreaterThan(0);

    // User Issues
    // Expect u3 (email format) and u1 duplicate (unique)
    // Wait, duplicate u1 might trigger unique constraint on the *second* occurrence.
    const emailFail = issues.find(
      (i) => i.id === "email-format" && i.record.id === "u3",
    );
    expect(emailFail).toBeDefined();

    const uniqueUserFail = issues.find(
      (i) =>
        i.id === "unique-user-id" && i.record.email === "duplicate@example.com",
    );
    expect(uniqueUserFail).toBeDefined();

    // Product Issues
    const skuFail = issues.find(
      (i) => i.id === "sku-format" && i.record.sku === "invalid-sku",
    );
    expect(skuFail).toBeDefined();

    // Order FK Issues
    const userFkFail = issues.find(
      (i) => i.id === "fk-order-user" && i.record.id === "o3",
    );
    expect(userFkFail).toBeDefined();
    expect(userFkFail.message).toContain("Foreign key violation");

    const prodFkFail = issues.find(
      (i) => i.id === "fk-order-product" && i.record.id === "o4",
    );
    expect(prodFkFail).toBeDefined();

    // Check for no system errors
    expect(reporter.errors.length).toBe(0);
  });
});
