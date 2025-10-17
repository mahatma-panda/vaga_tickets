# Automated Testing Documentation

## Overview

This document describes the automated testing system for the Manufacturing Ticketing System. The test suite provides comprehensive coverage of all API endpoints, data integrity, and system performance.

## Test Structure

### Test Categories

1. **Health Check Tests**
   - API availability
   - System status verification

2. **Statistics Tests**
   - Pipeline statistics accuracy
   - Count aggregations

3. **Ticket CRUD Tests**
   - Create tickets
   - Read tickets (single and list)
   - Update ticket fields
   - Delete tickets

4. **Filter Tests**
   - Pipeline filtering
   - Status filtering
   - Search functionality

5. **Timeline Tests**
   - Timeline entry creation
   - Timeline integrity
   - Chronological ordering

6. **Edge Case Tests**
   - Non-existent resource handling
   - Missing required fields
   - Invalid field updates

7. **Data Integrity Tests**
   - Statistics consistency
   - Timeline chronology
   - Reference integrity

8. **Performance Tests**
   - Bulk operations
   - Response time benchmarks

## Running Tests

### Prerequisites

1. Ensure server is running:
   ```bash
   npm start
   ```

2. In a separate terminal, run tests:
   ```bash
   npm test
   ```

### Watch Mode

For continuous testing during development:
```bash
npm run test:watch
```

## Test Output

### Console Output

Tests provide colored console output:
- ✓ Green checkmarks for passed tests
- ✗ Red X marks for failed tests
- Detailed error messages for failures

Example output:
```
Starting Ticketing System Test Suite

>>> Health Check Tests
✓ API Health Check

>>> Statistics Tests
✓ Get Statistics

>>> Ticket CRUD Tests
✓ Get All Tickets
✓ Create New Ticket
✓ Get Single Ticket
...

============================================================
Test Summary
============================================================
Total Tests: 25
Passed: 25
Failed: 0
Duration: 3.45s
============================================================
```

### Decision Log Output

All test runs and significant events are automatically logged to `DECISION_LOG.md`:

```markdown
## TEST_START: Automated Testing Initiated
**Date**: 2025-10-16T10:30:00.000Z
**Description**: Beginning comprehensive test suite for ticketing system

## TEST_PASS: Create New Ticket
**Date**: 2025-10-16T10:30:01.234Z
**Description**: Test passed successfully

## TICKET_CREATED: Test Ticket Created
**Date**: 2025-10-16T10:30:01.235Z
**Description**: Created test ticket TKT-005 for testing purposes
```

## Writing New Tests

### Basic Test Structure

```javascript
await runner.test('Test Name', async () => {
    // Arrange
    const data = { /* test data */ };
    
    // Act
    const result = await api.post('/endpoint', data);
    
    // Assert
    await runner.assertEqual(result.field, expectedValue, 'Error message');
});
```

### Assertion Methods

#### assertEqual(actual, expected, message)
Compares two values for equality (deep comparison).

```javascript
await runner.assertEqual(ticket.status, 'new', 'Status should be new');
```

#### assertNotNull(value, message)
Ensures a value is not null or undefined.

```javascript
await runner.assertNotNull(ticket.id, 'Ticket should have an ID');
```

#### assertTrue(value, message)
Ensures a value is truthy.

```javascript
await runner.assertTrue(Array.isArray(tickets), 'Should return array');
```

#### assertGreaterThan(actual, expected, message)
Ensures actual value is greater than expected.

```javascript
await runner.assertGreaterThan(tickets.length, 0, 'Should have tickets');
```

### API Helper Methods

#### GET Request
```javascript
const tickets = await api.get('/tickets');
const ticket = await api.get('/tickets/TKT-001');
```

#### POST Request
```javascript
const newTicket = await api.post('/tickets', {
    title: 'Test',
    description: 'Test description',
    pipeline: 'marketing',
    priority: 'high'
});
```

#### PUT Request
```javascript
const updated = await api.put('/tickets/TKT-001', {
    field: 'status',
    value: 'in-progress',
    oldValue: 'new'
});
```

#### DELETE Request
```javascript
await api.delete('/tickets/TKT-001');
```

## Decision Logging

### Manual Logging

Add manual decision log entries during tests:

```javascript
runner.logDecision(
    'DECISION_TYPE',      // e.g., FEATURE, BUGFIX, REFACTOR
    'Decision Title',     // Short descriptive title
    'Detailed description of the decision or change',
    { /* optional metadata */ }
);
```

Example:
```javascript
runner.logDecision(
    'FEATURE',
    'Added Email Notifications',
    'Implemented email notifications for status changes',
    { 
        affectedEndpoints: ['/api/tickets/:id'],
        emailProvider: 'SendGrid'
    }
);
```

### Decision Log Categories

Use these standardized categories for consistency:

- **ARCHITECTURE**: System design decisions
- **FEATURE**: New feature implementations
- **BUGFIX**: Bug fixes and corrections
- **REFACTOR**: Code improvements without behavior changes
- **PERFORMANCE**: Performance optimizations
- **SECURITY**: Security-related changes
- **DATABASE**: Schema or data changes
- **API**: API endpoint changes
- **UI/UX**: User interface improvements
- **TESTING**: Test-related changes
- **DOCUMENTATION**: Documentation updates
- **DEPLOYMENT**: Deployment and operations changes
- **INTEGRATION**: Third-party integrations
- **MAINTENANCE**: Routine maintenance tasks

## Test Data Management

### Test Ticket Creation

Tests automatically create temporary tickets with "Test" prefix in titles:

```javascript
const newTicket = {
    title: 'Test Ticket - Performance',
    description: 'Created by automated testing',
    customer: 'Test Customer',
    pipeline: 'marketing',
    priority: 'high',
    assigned_to: 'Test User'
};
```

### Cleanup

All test tickets are automatically cleaned up at the end of the test suite:

```javascript
await runner.test('Delete Test Tickets', async () => {
    const tickets = await api.get('/tickets?search=Test');
    for (const ticket of tickets) {
        if (ticket.title.includes('Test')) {
            await api.delete(`/tickets/${ticket.id}`);
        }
    }
});
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Start server
      run: npm start &
      
    - name: Wait for server
      run: sleep 5
    
    - name: Run tests
      run: npm test
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test

test:
  stage: test
  image: node:18
  script:
    - npm install
    - npm start &
    - sleep 5
    - npm test
  artifacts:
    paths:
      - DECISION_LOG.md
```

## Performance Benchmarks

### Expected Response Times

| Operation | Expected Time | Threshold |
|-----------|--------------|-----------|
| GET /api/tickets | < 100ms | < 200ms |
| POST /api/tickets | < 150ms | < 300ms |
| PUT /api/tickets/:id | < 100ms | < 200ms |
| GET /api/stats | < 50ms | < 100ms |
| Bulk create 10 tickets | < 3s | < 5s |

### Adding Performance Tests

```javascript
await runner.test('Response Time Test', async () => {
    const startTime = Date.now();
    await api.get('/tickets');
    const duration = Date.now() - startTime;
    
    await runner.assertTrue(
        duration < 200,
        `Response should be < 200ms (was ${duration}ms)`
    );
});
```

## Troubleshooting

### Server Not Running

**Error**: `ECONNREFUSED`

**Solution**: Ensure server is running before tests:
```bash
npm start
# Wait for "Server running on http://localhost:3000"
# Then in another terminal:
npm test
```

### Port Already in Use

**Error**: `EADDRINUSE`

**Solution**: Kill process on port 3000:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Tests Timing Out

**Solution**: Increase timeout in test configuration or check server logs for errors.

### Database Lock Errors

**Error**: `SQLITE_BUSY`

**Solution**: Ensure no other processes are accessing the database file.

## Test Coverage Goals

Current coverage goals:

- ✅ **API Endpoints**: 100% coverage
- ✅ **CRUD Operations**: All operations tested
- ✅ **Filter Functions**: All filters tested
- ✅ **Error Handling**: Major error cases covered
- ✅ **Data Integrity**: Key integrity checks in place
- 🔄 **Performance**: Basic benchmarks (expand as needed)
- 🔄 **Load Testing**: Not yet implemented (future enhancement)

## Future Enhancements

### Planned Test Improvements

1. **Load Testing**
   - Simulate multiple concurrent users
   - Test with large datasets (1000+ tickets)
   - Measure database performance under load

2. **Integration Tests**
   - Test frontend-backend integration
   - Test with real browser (Selenium/Puppeteer)
   - End-to-end user workflows

3. **Security Tests**
   - SQL injection attempts
   - XSS vulnerability scanning
   - Rate limiting tests

4. **Regression Suite**
   - Automated visual regression testing
   - Database migration testing
   - Backwards compatibility tests

5. **Monitoring Integration**
   - Alert on test failures
   - Track test execution metrics
   - Performance trend analysis

## Best Practices

### 1. Test Independence

Each test should be independent and not rely on other tests:

```javascript
// ❌ Bad: Depends on previous test
await runner.test('Update Ticket', async () => {
    await api.put('/tickets/TKT-001', { ... }); // Assumes TKT-001 exists
});

// ✅ Good: Creates own test data
await runner.test('Update Ticket', async () => {
    const ticket = await api.post('/tickets', testData);
    await api.put(`/tickets/${ticket.id}`, { ... });
    await api.delete(`/tickets/${ticket.id}`); // Cleanup
});
```

### 2. Descriptive Test Names

```javascript
// ❌ Bad
await runner.test('Test 1', async () => { ... });

// ✅ Good
await runner.test('Create ticket with all required fields', async () => { ... });
```

### 3. Clear Assertions

```javascript
// ❌ Bad
await runner.assertTrue(ticket.status === 'new');

// ✅ Good
await runner.assertEqual(
    ticket.status,
    'new',
    'New tickets should have status "new"'
);
```

### 4. Test Data Cleanup

Always clean up test data:

```javascript
let testTicketId;

await runner.test('Create Ticket', async () => {
    const ticket = await api.post('/tickets', testData);
    testTicketId = ticket.id;
});

// ... more tests ...

await runner.test('Cleanup', async () => {
    if (testTicketId) {
        await api.delete(`/tickets/${testTicketId}`);
    }
});
```

### 5. Document Decisions

Log important decisions made during testing:

```javascript
await runner.test('Performance Optimization', async () => {
    // Test implementation
    
    runner.logDecision(
        'PERFORMANCE',
        'Optimized Bulk Operations',
        'Implemented batch processing for bulk ticket creation',
        { improvement: '40% faster', method: 'Promise.all' }
    );
});
```

## Reporting Issues

When tests fail:

1. **Check DECISION_LOG.md** for recent changes
2. **Review test output** for specific error messages
3. **Check server logs** for backend errors
4. **Verify database state** (check tickets.db)
5. **Document findings** in decision log

Example issue documentation:

```markdown
## BUGFIX: Test Failure Investigation
**Date**: 2025-10-16T15:30:00.000Z
**Description**: "Filter by Status" test failing intermittently
**Root Cause**: Race condition in database query
**Resolution**: Added proper async/await handling
**Impact**: Tests now stable, no functional impact on production
```

## Metrics Tracking

Track these metrics over time:

- **Pass Rate**: Target >95%
- **Execution Time**: Trend should remain stable
- **Coverage**: Aim for comprehensive endpoint coverage
- **Reliability**: Tests should be deterministic

Update DECISION_LOG.md when metrics change significantly:

```markdown
## METRICS: Test Suite Performance
**Date**: 2025-10-16T16:00:00.000Z
**Pass Rate**: 100% (25/25 tests)
**Execution Time**: 3.45s (improved from 4.2s)
**New Tests Added**: 3 (timeline validation)
**Optimization**: Parallel test execution reduced time by 18%
```

## Support

For testing issues or questions:

1. Review this documentation
2. Check DECISION_LOG.md for context
3. Examine test output and server logs
4. Document findings for team reference

---

**Last Updated**: 2025-10-16  
**Test Suite Version**: 1.0.0  
**Maintained By**: Development Team
