# My Standards

## TypeScript

- Never use `any` as a TypeScript type.

## Async / Error Handling

- Always handle promise rejections explicitly — every `.then()` must have a `.catch()`, and every `await` must be inside a `try/catch`.
- Never leave a `catch` block empty.

## Configuration

- Never hard-code environment-specific variables. All configuration must come from environment variables.

## Testing

- Always write the test before the implementation (TDD).
- Never commit without a passing test suite.

## Imports

- Never import from a barrel file. Always import from the specific module file.
