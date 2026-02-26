# Data Constraints

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)
[![CI](https://github.com/GandalFran/data-constraints/actions/workflows/ci.yml/badge.svg)](https://github.com/GandalFran/data-constraints/actions/workflows/ci.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**Data Constraints** is the easiest way to validate your data streams. Whether you have small JSON files or massive CSV dumps, this tool ensures your data isn't garbage.

---

## 🚀 Why Data Constraints?

- **Rule-Based**: Define your rules in simple JSON/YAML files. No coding required.
- **Universal**: Works with JSON and CSV out of the box.
- **Developer Friendly**: Written in JavaScript, typed with TypeScript.

## ⚡ Basic Use Case (At a glance)

Imagine you have a `users.json` file and you want to ensure all emails are valid.

**1. Your Data (`users.json`)**:
```json
[
  { "id": 1, "email": "alice@example.com" },
  { "id": 2, "email": "bob-has-no-domain" }
]
```

**2. Your Rules (`config.json`)**:
```json
{
  "sources": {
    "users": { "type": "file", "path": "users.json", "format": "json" }
  },
  "constraints": [
    {
      "type": "format",
      "id": "valid-email",
      "service": "users",
      "field": "email",
      "regex": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      "message": "Invalid email: {{email}}"
    }
  ]
}
```

**3. Run and get results**:
```bash
$ npx data-constraints validate --config config.json
[INFO] Validating data...
[valid-email] (format) Invalid email: bob-has-no-domain
Validation finished. Found 1 issues.
```

## 📦 Installation

To use as a CLI globally:
```bash
npm install -g data-constraints
```

Or install locally in your project:
```bash
npm install data-constraints
```

Then you can run `npx data-constraints` from your project folder.

## 🧠 Basic Concepts

**Data Constraints** works with three core files:
1. **Data Files**: Your actual data dumps in `.json` or `.csv` format.
2. **Config File**: A JSON file pointing the engine to your data and rules.
3. **Constraints (Rules)**: The definitions of what is valid.

### Rule Types at a Glance

*   **📝 Format**: Ensure strings look correct (e.g. Emails).
    *   *Example*: `"regex": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"`
*   **🆔 Unique**: Ensure no duplicate IDs exist across a file.
    *   *Example*: `"field": "employee_id"`
*   **🔗 Foreign Key**: Ensure referenced IDs actually exist in another file.
    *   *Example*: `order.userId` must exist in `users.id`

## 📚 Documentation

For full documentation, guides and advanced use cases, please check the [**docs/ directory**](./docs/).

- **[Key Concepts](./docs/concepts.md)**: Easy-to-understand explanation of file types and constraints.
- **[User Guide](./docs/guide.md)**: The comprehensive guide to using the CLI and defining rules.
- **[Integration Guide](./docs/integration.md)**: How to integrate the engine programmatically in Node.js.
- **[Examples](./docs/examples)**: Runnable examples, ranging from simple to e-commerce.

## 🛠️ Features

| Feature | Description |
| :--- | :--- |
| **Format Validation** | Regex-based validation for strings (Emails, Phones, Codes). |
| **Unique Validation** | Ensure IDs and codes are unique across your dataset. |
| **Foreign Keys** | Validate relationships between different files (e.g. `order.userId` -> `user.id`). |
| **Multiple Reporters** | Output results to Console, JSON, or Markdown files. |

## 🤝 Contributing

In **Data Constraints** contributions, bug reports, and feature requests are welcome. If you have ideas, just launch you PRs!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
