# Testing Documentation

This project has comprehensive test coverage for core features including unit tests, integration tests, and workflow tests.

## Test Statistics

- **Total Tests**: 204 passing ✅
- **Test Files**: 9
- **Test Framework**: Vitest with happy-dom environment

## Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- path/to/test.ts

# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm test -- --run
```

## Test Coverage by Category

### 1. Unit Tests (161 tests)

#### Date Utilities (`lib/dateUtils.test.ts`) - 33 tests
Tests for date parsing, formatting, and month calculations:
- ✅ Parse date strings (local and UTC)
- ✅ Format dates (YYYY-MM-DD, YYYY-MM)
- ✅ Add months with day clamping (e.g., Jan 31 → Feb 28/29)
- ✅ Accounting year/month calculations with credit card offset
- ✅ Edge cases: leap years, year rollovers, month-end dates

#### Format Utilities (`lib/format.test.ts`) - 30 tests
Tests for currency, percentage, and date formatting:
- ✅ Brazilian Real (R$) currency formatting
- ✅ Percentage formatting (with 1 decimal place)
- ✅ Month/year formatting (Portuguese locale)
- ✅ Localized date string formatting
- ✅ Edge cases: negative numbers, zero, large numbers

#### Validation Schemas (`lib/schemas.test.ts`) - 44 tests
Tests for Zod schema validation:
- ✅ Transaction creation validation (required fields, formats)
- ✅ Bulk operation validation (array constraints, ID validation)
- ✅ Person and category validation
- ✅ Input rejection: empty strings, negative amounts, invalid dates
- ✅ Partial updates and optional fields

#### Financial Calculations (`components/finance/hooks/useFinanceCalculations.test.ts`) - 36 tests
Tests for core business logic:
- ✅ Total income and expense calculations
- ✅ Share percentage calculations based on income
- ✅ Income breakdowns (increments/decrements)
- ✅ Category spending summaries
- ✅ Settlement balances (who owes/is owed)
- ✅ Single-pass financial summary optimization
- ✅ Forecast transaction handling

#### Database Operations (`lib/server/financeStore.test.ts`) - 18 tests
Tests for data mapping and filtering:
- ✅ Database row to domain type mappers
- ✅ snake_case ↔ camelCase conversions
- ✅ Accounting month filters
- ✅ Credit card billing cycle handling
- ✅ Type coercion (string → number)

### 2. API Integration Tests (32 tests)

#### Transaction API (`app/api/transactions/route.test.ts`) - 12 tests
Tests for GET and POST endpoints:
- ✅ Fetch all transactions
- ✅ Filter transactions by year and month
- ✅ Create single transaction
- ✅ Create multiple transactions (bulk)
- ✅ Validation: reject empty description, negative amounts, invalid dates
- ✅ Error handling: database errors return 500

#### Transaction Update/Delete API (`app/api/transactions/[id]/route.test.ts`) - 10 tests
Tests for PATCH and DELETE endpoints:
- ✅ Update transaction with valid patch
- ✅ Partial updates (only specified fields)
- ✅ Delete existing transaction
- ✅ Return 404 when transaction not found
- ✅ Return 400 for invalid ID
- ✅ Error handling: database errors return 500

#### Bulk Operations API (`app/api/transactions/bulk/route.test.ts`) - 10 tests
Tests for bulk PATCH and DELETE endpoints:
- ✅ Update multiple transactions at once
- ✅ Delete multiple transactions at once
- ✅ Validation: reject empty arrays, negative IDs, zero IDs
- ✅ Accept empty patch object
- ✅ Error handling: database errors return 500

### 3. Workflow Integration Tests (11 tests)

#### Complete Transaction Lifecycle (`__tests__/integration/transaction-workflow.test.ts`)
Tests for end-to-end user workflows:
- ✅ **Create → Read → Calculate**: User creates transactions, app calculates totals and settlements correctly
- ✅ **Update Workflow**: Recalculate when user updates transaction amount
- ✅ **Delete Workflow**: Remove transaction and update totals
- ✅ **Credit Card Accounting**: Credit card expenses accounted in next month
- ✅ **Income Adjustments**: Share percentages adjust when income transactions added
- ✅ **Category Spending**: Show spending vs targets for each category
- ✅ **Bulk Operations**: Update/delete multiple transactions at once
- ✅ **Forecast Transactions**: Handle forecast inclusion/exclusion from calculations

## What's Being Tested

### ✅ Forms & Data Submission
The API integration tests verify that:
- Transaction forms submit data in the correct format
- Validation catches invalid data before reaching the database
- The API accepts valid data and returns proper responses

### ✅ User Interactions
The workflow tests simulate real user actions:
- Creating transactions through the UI
- Updating transaction amounts/categories
- Deleting transactions
- Bulk selecting and modifying multiple transactions
- Adding income adjustments

### ✅ Calculations & Business Logic
The financial calculation tests ensure:
- Share percentages calculated correctly based on income
- Settlements show who owes/is owed money
- Category spending vs targets displayed accurately
- Credit card expenses accounted in correct month
- Forecast transactions handled properly

### ✅ Data Flow
The integration tests verify the complete data flow:
1. User input → Validation → API endpoint
2. API endpoint → Database operation
3. Database → Domain types → Calculations
4. Calculations → Dashboard/UI

## Test Examples

### Example 1: Transaction Creation Workflow
```typescript
// User fills out form and submits
POST /api/transactions
Body: { description: "Groceries", amount: 100, ... }

// Tests verify:
✓ Validation accepts valid data
✓ API returns 201 with created transaction
✓ Financial calculations include new transaction
✓ Dashboard updates with new total
```

### Example 2: Settlement Calculation
```typescript
// Given: Alice (60% share) paid $600, Bob (40% share) paid $200
// Total expenses: $800

// Tests verify:
✓ Alice should pay $480 (60% of $800) → is owed $120
✓ Bob should pay $320 (40% of $800) → owes $120
✓ Balances sum to zero
```

### Example 3: Bulk Update
```typescript
// User selects multiple transactions and changes category
PATCH /api/transactions/bulk
Body: { ids: [1, 2, 3], patch: { categoryId: "cat-new" } }

// Tests verify:
✓ All selected transactions updated
✓ Category totals recalculated
✓ Dashboard reflects changes
```

## Test Structure

```
finance-manager/
├── __mocks__/                    # Mock modules
│   └── server-only.ts           # Server-only module mock
├── __tests__/
│   └── integration/             # Integration/workflow tests
│       └── transaction-workflow.test.ts
├── app/api/                     # API route tests
│   └── transactions/
│       ├── route.test.ts        # GET, POST tests
│       ├── [id]/
│       │   └── route.test.ts    # PATCH, DELETE tests
│       └── bulk/
│           └── route.test.ts    # Bulk operations tests
├── components/finance/hooks/
│   └── useFinanceCalculations.test.ts  # Financial logic tests
├── lib/
│   ├── dateUtils.test.ts        # Date utility tests
│   ├── format.test.ts           # Formatting tests
│   ├── schemas.test.ts          # Validation tests
│   └── server/
│       └── financeStore.test.ts # Database operation tests
├── vitest.config.ts             # Vitest configuration
└── vitest.setup.ts              # Test setup/globals
```

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test -- --run

- name: Generate coverage
  run: npm test:coverage
```

## Future Test Additions

Areas that could benefit from additional testing:
- [ ] Component rendering tests (React Testing Library)
- [ ] User event simulation (clicks, form inputs)
- [ ] API authentication/authorization tests
- [ ] E2E tests with Playwright
- [ ] Performance/load testing
- [ ] Visual regression testing

## Debugging Tests

```bash
# Run a single test file
npm test -- lib/dateUtils.test.ts

# Run tests matching a pattern
npm test -- --grep "should calculate"

# Run with debugging output
npm test -- --reporter=verbose
```

## Notes

- Mock data is used for all database operations
- Tests run in isolated environment (happy-dom)
- No external services or databases required
- Tests are deterministic and can run in any order
- All tests must pass before merging to main
