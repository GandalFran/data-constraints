# 💻 Programmatic Integration

While the CLI is great for standalone validation, `data-constraints` is designed to be fully integrated into your existing Node.js applications. 

You can dynamically configure the engine, add sources directly from memory, API responses, or databases, and define constraints programmatically.

## Step-by-Step Example

Here is a complete example of how to instantiate the engine and run validations in your code:

```javascript
const { 
    DataEngine, 
    DataSource, 
    constraints, 
    loaders, 
    reporters 
} = require('data-constraints');

async function validateMyData() {
    // 1. Initialize the Engine
    const engine = new DataEngine({});

    // 2. Add Data Sources Dynamically
    
    // 2A. In-Memory Source (Array of objects)
    const usersData = [
        { id: "u1", email: "alice@example.com", roleId: "admin" },
        { id: "u2", email: "bob-no-domain", roleId: "user" }
    ];
    engine.addSource(
        'users', 
        DataSource.memory(usersData), 
        loaders.JsonLoader
    );

    // 2B. File Source (e.g. A CSV downloaded from S3 or local FS)
    engine.addSource(
        'roles', 
        DataSource.file('./data/roles.csv'), 
        loaders.CsvLoader
    );

    // 3. Define Constraints Programmatically
    
    // A Format Constraint
    const emailConstraint = new constraints.FormatConstraint('valid-email')
        .setService('users')
        .setField('email')
        .setRegex('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
        .setMessage('Invalid email found: {{email}}');
        
    // A Foreign Key Constraint
    const roleConstraint = new constraints.ForeignKeyConstraint('valid-role')
        .setService('users')
        .setField('roleId')
        .setReferenceService('roles')
        .setReferenceField('id')
        .setMessage('Role ID {{roleId}} does not exist.');

    // 4. Register Constraints
    engine.addConstraint(emailConstraint);
    engine.addConstraint(roleConstraint);

    // 5. Run Validation with a Reporter
    // Here we use the ConsoleReporter, but you can use JsonReporter or build your own!
    const reporter = new reporters.ConsoleReporter();
    
    console.log("Starting programmatic validation...");
    await engine.run(reporter);
    console.log("Validation complete!");
}

validateMyData().catch(console.error);
```

## 🧩 Detailed Usage

### 1. Data Sources (`DataSource` & `loaders`)

You must add data to the engine before validating. `data-constraints` provides helpers to achieve this:

- `DataSource.memory(array)`: Directly load a JavaScript array.
- `DataSource.file(path)`: Stream an external file.

You combine these with **Loaders** to tell the engine how to parse the source:
- `loaders.JsonLoader`: Parses a JSON structure.
- `loaders.CsvLoader`: Parses a CSV structure row by row.

### 2. Constraints (Rules)

Each constraint is instantiated from the `constraints` object. They use a Fluent API (chainable methods) for easy setup:

- **Common properties for all constraints**:
  - `setId(string)`: Set the constraint ID (defaults to the constructor argument).
  - `setService(string)`: Set the name of the source dataset to watch (`users`, `orders`).
  - `setMessage(string)`: Optional custom error message template.

- **Specific properties**:
  - `FormatConstraint`: Requires `setField(string)` and `setRegex(string)`.
  - `UniqueConstraint`: Requires `setField(string)`.
  - `ForeignKeyConstraint`: Requires `setField(string)`, `setReferenceService(string)` (target dataset), and `setReferenceField(string)` (target field).

## Handling Validation Errors (Default Behavior)

If you don't supply a reporter to `engine.run()`, the engine automatically uses the `ExceptionReporter`, which accumulates all validation issues and throws a custom `ValidationError` when the validation finishes. This is very useful when you want to fail fast strictly:

```javascript
try {
    // No reporter passed; defaults to ExceptionReporter
    await engine.run(); 
    console.log("Validation complete! No issues found.");
} catch (error) {
    if (error.name === 'ValidationError') {
        console.error(`Validation failed with ${error.violations.length} issues!`);
        console.error(error.violations); // Inspect all errors
    } else {
        throw error; // Other unexpected errors
    }
}
```

## Creating Custom Reporters

If you want to handle the errors dynamically in your code (e.g. failing a CI build with a custom format, or returning HTTP 400), you can build your own reporter by extending `ReporterBase` and passing it to `engine.run(reporter)`. Alternatively, you can instantiate the existing reporters:

- `new reporters.ConsoleReporter()`: Prints directly to standard output.
- `new reporters.JsonReporter(path?)`: Writes a full JSON array of issues to a file, or outputs to console if no path is given.
- `new reporters.MarkdownReporter(path?)`: Generates a formatted markdown document.
- `new reporters.ExceptionReporter()`: The default behavior (throws ValidationError).
