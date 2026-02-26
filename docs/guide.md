# 📖 User Guide

This guide provides detailed instructions on how to install, configure, and use `data-constraints`.

## 📦 Installation

```bash
npm install data-constraints
```

## 🛠️ Usage

### 💻 CLI

The primary way to use `data-constraints` is via the Command Line Interface (CLI).

```bash
npx data-constraints validate --config <path-to-config> [options]
```

**Options:**
- `-c, --config <path>`: **Required**. Path to the configuration JSON file.
- `-d, --data <dir>`: Optional override for the data directory (defaults to finding sources relative to config).
- `-f, --format <format>`: Output format. Options: `console` (default), `json`, `markdown`.
- `-o, --output <path>`: File path to write the report to (optional).
- `--debug`: Enable debug logging.
- `--silent`: Disable all logging.

### ⚙️ Configuration (`config.json`)

The configuration file defines your data sources and the constraints to apply.

```json
{
    "sources": [
        {
            "service": "users",          // Unique identifier for this data source
            "path": "data/users.json",   // Path relative to this config file
            "type": "json",              // "json" or "csv"
            "arrayPath": "*"             // Optional: JSON path to array (default root)
        }
    ],
    "constraints": "constraints.json"    // Path to constraints file OR inline object
}
```

### 📏 Constraints (`constraints.json`)

Defines the rules for validation, grouped by constraint type.

```json
{
    "constraints": {
        "format": [ ... ],
        "unique": [ ... ],
        "foreign-key": [ ... ]
    }
}
```

#### 📝 1. Format Constraint
Validates that a field matches a regular expression.

- `id`: Unique constraint ID.
- `service`: The service/source to validate.
- `field`: The property path to check (supports nested paths like `profile.email`).
- `regex`: The regular expression pattern.
- `message`: Custom error message (supports `{{value}}` interpolation).

#### 2. Unique Constraint
Ensures a field value is unique across the dataset.

- `id`: Unique constraint ID.
- `service`: The service/source to validate.
- `field`: The property path to check.

#### 3. Foreign Key Constraint
Validates relationships between datasets.

**Simple Mode:**
- `field`: Field in source service.
- `referenceService`: Target service name.
- `referenceField`: Field in target service.

**Advanced Mode:**
- `variables`: Map of variable names to source fields (e.g., `{ "uid": "userId", "active": "isActive" }`).
- `target`: MongoDB-style query filtering the reference dataset.
  - Supports operators: `$eq`, `$ne`, `$gt`, `$lt`, `$and`, `$or`, `$contains`.
  - Values can be interpolated strings: `"{{uid}}"`.

## 💡 Examples

Check out the [examples directory](./examples) for runnable scenarios:
- [User Catalog Example](./examples/user-catalog/README.md): Simple CSV/JSON validation.
- [E-commerce Example](./examples/e-commerce/README.md): Advanced complex validation.
