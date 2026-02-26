# 📚 data-constraints Documentation

Welcome to the documentation for **Data Constraints**! This is the easiest way to validate your data streams. Whether you have small JSON files or massive CSV dumps, this tool ensures your data isn't garbage.

## 🚀 Quick Start

1.  **Install**: `npm install data-constraints`
2.  **Run**: `npx data-constraints validate -c config.json`

## 📚 Documentation

- **[Key Concepts](./concepts.md)**: Easy-to-understand explanation of file types and constraints.
- **[User Guide](./guide.md)**: Detailed instructions on configuration, CLI usage, and constraint types.
- **[Integration Guide](./integration.md)**: How to integrate the engine programmatically in Node.js.
- **[Examples](./examples)**: Ready-to-run scenarios.

## 🛠️ Use Cases

We provide examples for different complexity levels:

### 1. [User Catalog Use Case](./examples/user-catalog/README.md)
Start here if you are validating simple JSON/CSV files.
- **Features**: Format checks (Regex), Uniqueness checks.
- **Data**: Single User list.

### 2. [E-commerce Use Case](./examples/e-commerce/README.md)
Explore the full power of the engine for enterprise-grade validation.
- **Features**: 
    - Nested property access (`profile.contact.email`)
    - Array traversal and validation
    - **Correlated Validation**: Ensuring valid combinations of fields (e.g., Product X from Supplier Y)
    - **Complex Queries**: Logic-based validation (e.g., User must be Active)
    - **Cross-Service References**: Validating Foreign Keys across different datasets (Orders referencing Users and Products)
- **Data**: Complex ecosystem of Users, Orders, and Products.

## Guides

- [Key Concepts](./concepts.md)
- [User Guide / Configuration](./guide.md)
- [Constraint Reference](./concepts.md#2-constraint-types)
- [Integration Guide](./integration.md)
