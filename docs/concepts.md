# 🧠 Key Concepts & Usage

Understanding **data-constraints** is simple! It uses three main types of files to work:

## 📂 1. File Types

- **Data Files**: These are your actual data dumps. We natively support `.json` and `.csv` files.
- **Config File** (`config.json`): Tells the engine where your data files are, what format they have, and where the rules are located.
  * *Structure*: It contains `sources` mapping names to file paths, and `constraints` listing the rules.
- **Constraints File**: Contains the actual rules (constraints) that your data must follow. (Can be defined inside the Config File or separately).

## 📐 2. Constraint Types

Here are the types of rules you can apply to your data, with simple examples of how they work.

### 📝 A. Format Constraints
Validates that a text field matches a specific pattern (Regular Expression).

- **Use case**: You want to ensure an email looks like a real email, or a zip code has exactly 5 digits.
- **Rule Example** (From `user-catalog`):
  ```json
  {
      "id": "email-check",
      "service": "users",
      "field": "email",
      "regex": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      "message": "Invalid email: {{email}}"
  }
  ```
- **Input Example**: 
  ```json
  { "email": "bad-email-no-domain" }
  ```
- **Error Output**: 
  ```text
  [email-check] (format) Invalid email: {{email}}
  ```

### 🆔 B. Unique Constraints
Ensures that a specific field is not repeated across your entire dataset.

- **Use case**: You want to ensure no two users have the same `id` or the same `employee_code`.
- **Rule Example** (From `user-catalog`):
  ```json
  {
      "id": "unique-id",
      "service": "users",
      "field": "id",
      "message": "Duplicate ID"
  }
  ```
- **Input Example**: 
  ```json
  [
    { "id": "u1", "name": "Alice" },
    { "id": "u1", "name": "Bob" }
  ]
  ```
- **Error Output**: 
  ```text
  [unique-id] (unique) Value is not unique: u1
  ```

### 🔗 C. Foreign Key Constraints
Validates relationships between different data files to ensure data integrity.

- **Use case**: If an order belongs to `userId: "u5"`, then a user with `id: "u5"` **must exist** in the `users` data.
- **Rule Example** (From `user-catalog`):
  ```json
  {
      "id": "user-role-link",
      "service": "users",
      "field": "roleId",
      "referenceService": "roles",
      "referenceField": "id",
      "message": "User has invalid role ID: {{roleId}}"
  }
  ```
  ```text
  [user-role-link] (foreign-key) User has invalid role ID: r99
  ```
- **Configuration Properties**:
  - `field`: The property name in the source dataset. (Supports nested paths like `profile.roleId`).
  - `referenceService`: The name of the target dataset configured in your `sources`.
  - `referenceField`: The required field in the target dataset to match against.

---

## 📢 3. Reporters

Reporters determine how validation failures are presented to you:

1. **Console Reporter** (`ConsoleReporter`)
   - **Usage**: The default visual CLI reporter.
   - **Output**: Prints colored logs to your terminal summarizing successes and listing individual constraint failures.
2. **Markdown Reporter** (`MarkdownReporter`)
   - **Usage**: Generates a clean markdown report. Great for GitHub actions or documentation.
   - **Output**: Writes a Markdown file grouping errors by constraint ID for easy reading.
3. **JSON Reporter** (`JsonReporter`)
   - **Usage**: Best for automated pipelines and machine-reading.
   - **Output**: Writes a `.json` array of all rule violations containing the exact faulty records.
4. **Exception Reporter** (`ExceptionReporter`)
   - **Usage**: The *default* reporter if you integrate programmatically via JavaScript and don't provide one.
   - **Output**: Aggregates all errors and throws a custom `ValidationError` Exception containing an array of all violations. Perfect for "fail-fast" integrations.

---

## 🚀 How to Run

1. Prepare your data files.
2. Create your `config.json` and optionally a separate `constraints.json`.
3. Process your data using the CLI tool:

```bash
npx data-constraints validate --config config.json
```

A report will be generated in your console, or you can export it to markdown using `--format markdown`!
