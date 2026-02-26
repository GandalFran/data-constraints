# 🏢 E-commerce Use Case: Advanced Validation

This example demonstrates the full power of the `data-constraints` package, including:

1.  **Nested Property Access**: Validating deep fields like `profile.contact.email`.
2.  **Array Traversal**: Applying rules to every item in an array (`items` in orders).
3.  **Correlated Validation**: Ensuring that multiple fields in an array item (`productId` and `supplierId`) are valid *together* as a pair.
4.  **Contextual Validation**: Checking that a product in an order is available in the order's specific region.
5.  **Complex Queries**: filtering reference data (e.g., ensuring a User is `isActive`).

## 🗄️ Data Model

### Users (`users.json`)
Complex user objects with nested profiles, contact arrays, and status flags.

### Products (`products.json`)
Reference catalog containing product details, assigned suppliers, and allowed regions.

### Orders (`orders.json`)
Transactional data linking users and products, containing arrays of items and metadata.

## 🎯 Constraints

### 1. Active User Check
Ensures that the `userId` on an order corresponds to a user in the `users` service who is strictly **active**.

```json
{
    "id": "link-order-user-active",
    "variables": { "uid": "metadata.userId" },
    "target": {
        "$and": [
            { "id": { "$eq": "{{uid}}" } },
            { "isActive": { "$eq": true } }
        ]
    }
}
```

### 2. Product-Supplier Correlation
Ensures that for every item in an order, the specified `supplierId` actually supplies that `productId`. A simple check on `productId` and `supplierId` independently would fail to catch mismatches.

```json
{
    "id": "validate-product-supplier-pair",
    "variables": {
        "pid": "items.productId",
        "sid": "items.supplierId"
    },
    "target": {
        "$and": [
            { "id": { "$eq": "{{pid}}" } },
            { "supplierId": { "$eq": "{{sid}}" } }
        ]
    }
}
```

### 3. Region Availability
Ensures that the product ordered is available in the region where the order is placed (`metadata.region`).

```json
{
    "id": "validate-product-region-availability",
    "variables": {
        "pid": "items.productId",
        "orderRegion": "metadata.region"
    },
    "target": {
        "$and": [
            { "id": { "$eq": "{{pid}}" } },
            { "allowedRegions": { "$contains": "{{orderRegion}}" } }
        ]
    }
}
```

## 🚀 Running the Example

```bash
# Validate the data
data-constraints validate \
  --config docs/examples/e-commerce/config.json \
  --format console
```

## 📊 Expected Failures

The sample data intentionally includes invalid records to demonstrate detection:
- **Order o3**: `p1` is supplied by `s1`, but order claims `s2`. (Caught by `validate-product-supplier-pair`)

```text
[INFO] Building indexes...
[INFO] Validating data...
[INFO] Processing source: users
[INFO] Processing source: orders
[validate-product-supplier-pair] (foreign-key) Invalid Product-Supplier combination: Product p1 is not supplied by s2
[INFO] 
Validation finished. Found 1 issues.
```

## 📝 Markdown Report

If you run with `--format markdown`, you'll get this report:

```markdown
# Data Validation Report

Found 1 issues.

## Constraint: `validate-product-supplier-pair`

- **foreign-key**: Invalid Product-Supplier combination: Product p1 is not supplied by s2
  - Record: `{"id":"o3","metadata":{"userId":"u1","timestamp":"2023-10-29T09:15:00Z","region":"US"},"items":[{"productId":"p1","quantity":1,"supplierId":"s2"}],"status":"pending"}`
```
