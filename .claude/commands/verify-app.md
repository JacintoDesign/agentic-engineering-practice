Run the full verification suite for this project.

## Steps

1. Run the test suite serially:
   ```
   npm test -- --runInBand
   ```
   The test suite uses Supertest and exercises all API endpoints directly. Running with `--runInBand` ensures tests execute serially to avoid in-memory SQLite conflicts.

2. If all tests pass, report success:
   - Confirm all tests are passing
   - Confirm all API endpoints are verified

3. If any tests fail:
   - Identify the failing tests and the error messages
   - Fix the implementation (routes, services, or queries — never the tests unless the test itself is wrong)
   - Re-run `npm test -- --runInBand`
   - Repeat until all tests pass

## Report format

**All passing:** State the total number of tests and confirm all endpoints are verified and working correctly.

**Failures:** List each failing test by name, the specific assertion or error, and what was fixed (or what still needs addressing if not yet resolved).
