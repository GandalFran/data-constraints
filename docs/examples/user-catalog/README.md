# 📖 User Catalog Use Case: Simple Validation

This example demonstrates the basic capabilities of `data-constraints` for validating mixed JSON and CSV data with foreign key relationships.

## 🗄️ Data Model

### Users (`users.json`)
A list of user objects containing `id`, `email`, and a reference to their role (`roleId`).

### Roles (`roles.csv`)
A simple CSV reference table defining available roles (`id`, `name`).

## 🎯 Constraints

1.  **Email Format**: Checks that the `email` field matches a standard email regex.
2.  **Unique ID**: Ensures that the `id` field is unique across all user records.
3.  **Role Validation (Foreign Key)**: Ensures that the `roleId` assigned to a user exists in the `roles.csv` file.

## 🚀 Running the Example

```bash
# Validate the data
data-constraints validate \
  --config docs/examples/user-catalog/config.json \
  --format console
```

## 📊 Expected Output

You should see validation errors for user `u3`:
- **Format Error**: "invalid-email" does not match the regex.
- **Foreign Key Error**: "r99" is not a valid role ID found in `roles.csv`.

```text
[INFO] Building indexes...
[INFO] Validating data...
[INFO] Processing source: users
[email-check] (format) Invalid email: invalid-email
[user-role-link] (foreign-key) User has invalid role ID: r99
[INFO] 
Validation finished. Found 2 issues.
```

## 📝 Markdown Report

If you run with `--format markdown`, you'll get this report:

```markdown
# Data Validation Report

Found 2 issues.

## Constraint: `email-check`

- **format**: Invalid email: invalid-email
  - Record: `{"id":"u3","email":"invalid-email","roleId":"r99"}`

## Constraint: `user-role-link`

- **foreign-key**: User has invalid role ID: r99
  - Record: `{"id":"u3","email":"invalid-email","roleId":"r99"}`
```
