const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const API_URL = 'http://localhost:3000/api';
const TEST_DB = './test_tickets.db';
const DECISION_LOG = './DECISION_LOG.md';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.tests = [];
        this.startTime = Date.now();
    }

    async test(name, fn) {
        try {
            await fn();
            this.passed++;
            console.log(`${colors.green}✓${colors.reset} ${name}`);
            this.logDecision('TEST_PASS', name, 'Test passed successfully');
        } catch (error) {
            this.failed++;
            console.log(`${colors.red}✗${colors.reset} ${name}`);
            console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
            this.logDecision('TEST_FAIL', name, `Test failed: ${error.message}`);
        }
    }

    async assertEqual(actual, expected, message) {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(`${message}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
        }
    }

    async assertNotNull(value, message) {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }

    async assertTrue(value, message) {
        if (!value) {
            throw new Error(message);
        }
    }

    async assertGreaterThan(actual, expected, message) {
        if (actual <= expected) {
            throw new Error(`${message}\n  Expected > ${expected}, got ${actual}`);
        }
    }

    logDecision(type, title, description, metadata = {}) {
        const timestamp = new Date().toISOString();
        const entry = `
## ${type}: ${title}
**Date**: ${timestamp}
**Description**: ${description}
${Object.keys(metadata).length > 0 ? `**Metadata**: ${JSON.stringify(metadata, null, 2)}` : ''}

---
`;
        fs.appendFileSync(DECISION_LOG, entry);
    }

    summary() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        const total = this.passed + this.failed;
        
        console.log('\n' + '='.repeat(60));
        console.log(`${colors.cyan}Test Summary${colors.reset}`);
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`${colors.green}Passed: ${this.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${this.failed}${colors.reset}`);
        console.log(`Duration: ${duration}s`);
        console.log('='.repeat(60) + '\n');

        this.logDecision('TEST_SUMMARY', 'Test Run Completed', 
            `Completed test suite execution`, 
            { passed: this.passed, failed: this.failed, duration: `${duration}s` });

        return this.failed === 0;
    }
}

// API Test Helper
class APITester {
    async get(endpoint) {
        const response = await axios.get(`${API_URL}${endpoint}`);
        return response.data;
    }

    async post(endpoint, data) {
        const response = await axios.post(`${API_URL}${endpoint}`, data);
        return response.data;
    }

    async put(endpoint, data) {
        const response = await axios.put(`${API_URL}${endpoint}`, data);
        return response.data;
    }

    async delete(endpoint) {
        const response = await axios.delete(`${API_URL}${endpoint}`);
        return response.data;
    }
}

// Test Suite
async function runTests() {
    const runner = new TestRunner();
    const api = new APITester();

    console.log(`${colors.blue}Starting Ticketing System Test Suite${colors.reset}\n`);
    
    runner.logDecision('TEST_START', 'Automated Testing Initiated', 
        'Beginning comprehensive test suite for ticketing system');

    // Health Check Tests
    console.log(`\n${colors.yellow}>>> Health Check Tests${colors.reset}`);
    
    await runner.test('API Health Check', async () => {
        const health = await api.get('/health');
        await runner.assertNotNull(health.status, 'Health status should not be null');
        await runner.assertEqual(health.status, 'ok', 'Health status should be ok');
    });

    // Statistics Tests
    console.log(`\n${colors.yellow}>>> Statistics Tests${colors.reset}`);
    
    await runner.test('Get Statistics', async () => {
        const stats = await api.get('/stats');
        await runner.assertNotNull(stats.marketing, 'Marketing stats should exist');
        await runner.assertNotNull(stats.sales, 'Sales stats should exist');
        await runner.assertNotNull(stats.orders, 'Orders stats should exist');
        await runner.assertNotNull(stats.support, 'Support stats should exist');
    });

    // Ticket CRUD Tests
    console.log(`\n${colors.yellow}>>> Ticket CRUD Tests${colors.reset}`);
    
    let testTicketId;
    
    await runner.test('Get All Tickets', async () => {
        const tickets = await api.get('/tickets');
        await runner.assertTrue(Array.isArray(tickets), 'Tickets should be an array');
        await runner.assertGreaterThan(tickets.length, 0, 'Should have at least one ticket');
    });

    await runner.test('Create New Ticket', async () => {
        const newTicket = {
            title: 'Test Ticket',
            description: 'This is a test ticket created by automated testing',
            customer: 'Test Customer',
            pipeline: 'marketing',
            priority: 'high',
            assigned_to: 'Test User'
        };
        
        const ticket = await api.post('/tickets', newTicket);
        testTicketId = ticket.id;
        
        await runner.assertNotNull(ticket.id, 'Ticket should have an ID');
        await runner.assertEqual(ticket.title, newTicket.title, 'Title should match');
        await runner.assertEqual(ticket.status, 'new', 'New ticket should have status "new"');
        
        runner.logDecision('TICKET_CREATED', 'Test Ticket Created', 
            `Created test ticket ${ticket.id} for testing purposes`);
    });

    await runner.test('Get Single Ticket', async () => {
        const ticket = await api.get(`/tickets/${testTicketId}`);
        await runner.assertNotNull(ticket.id, 'Ticket should exist');
        await runner.assertEqual(ticket.id, testTicketId, 'Ticket ID should match');
        await runner.assertTrue(Array.isArray(ticket.timeline), 'Ticket should have timeline');
    });

    await runner.test('Update Ticket Status', async () => {
        const updated = await api.put(`/tickets/${testTicketId}`, {
            field: 'status',
            value: 'in-progress',
            oldValue: 'new'
        });
        
        await runner.assertEqual(updated.status, 'in-progress', 'Status should be updated');
        
        runner.logDecision('TICKET_UPDATED', 'Test Ticket Status Changed', 
            `Updated test ticket ${testTicketId} status to in-progress`);
    });

    await runner.test('Update Ticket Pipeline', async () => {
        const updated = await api.put(`/tickets/${testTicketId}`, {
            field: 'pipeline',
            value: 'sales',
            oldValue: 'marketing'
        });
        
        await runner.assertEqual(updated.pipeline, 'sales', 'Pipeline should be updated');
    });

    await runner.test('Update Ticket Priority', async () => {
        const updated = await api.put(`/tickets/${testTicketId}`, {
            field: 'priority',
            value: 'low',
            oldValue: 'high'
        });
        
        await runner.assertEqual(updated.priority, 'low', 'Priority should be updated');
    });

    // Filter Tests
    console.log(`\n${colors.yellow}>>> Filter Tests${colors.reset}`);
    
    await runner.test('Filter by Pipeline', async () => {
        const tickets = await api.get('/tickets?pipeline=sales');
        await runner.assertTrue(Array.isArray(tickets), 'Should return array');
        tickets.forEach(ticket => {
            if (ticket.pipeline !== 'sales') {
                throw new Error(`Ticket ${ticket.id} has wrong pipeline: ${ticket.pipeline}`);
            }
        });
    });

    await runner.test('Filter by Status', async () => {
        const tickets = await api.get('/tickets?status=in-progress');
        await runner.assertTrue(Array.isArray(tickets), 'Should return array');
        tickets.forEach(ticket => {
            if (ticket.status !== 'in-progress') {
                throw new Error(`Ticket ${ticket.id} has wrong status: ${ticket.status}`);
            }
        });
    });

    await runner.test('Search Tickets', async () => {
        const tickets = await api.get('/tickets?search=Test');
        await runner.assertTrue(Array.isArray(tickets), 'Should return array');
        await runner.assertGreaterThan(tickets.length, 0, 'Should find test ticket');
    });

    // Timeline Tests
    console.log(`\n${colors.yellow}>>> Timeline Tests${colors.reset}`);
    
    await runner.test('Add Timeline Entry', async () => {
        const entry = await api.post(`/tickets/${testTicketId}/timeline`, {
            action: 'Test action performed',
            user: 'Test Automation'
        });
        
        await runner.assertNotNull(entry.id, 'Timeline entry should have ID');
        await runner.assertEqual(entry.action, 'Test action performed', 'Action should match');
    });

    await runner.test('Verify Timeline in Ticket', async () => {
        const ticket = await api.get(`/tickets/${testTicketId}`);
        await runner.assertTrue(ticket.timeline.length > 0, 'Timeline should have entries');
        
        const hasTestAction = ticket.timeline.some(entry => 
            entry.action === 'Test action performed'
        );
        await runner.assertTrue(hasTestAction, 'Timeline should include test action');
    });

    // Edge Cases and Error Handling
    console.log(`\n${colors.yellow}>>> Edge Case Tests${colors.reset}`);
    
    await runner.test('Get Non-existent Ticket', async () => {
        try {
            await api.get('/tickets/TKT-99999');
            throw new Error('Should have thrown error for non-existent ticket');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // Expected behavior
            } else {
                throw error;
            }
        }
    });

    await runner.test('Create Ticket with Missing Fields', async () => {
        try {
            await api.post('/tickets', {
                title: 'Incomplete Ticket'
                // Missing required fields
            });
            throw new Error('Should have thrown error for missing fields');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Expected behavior
            } else {
                throw error;
            }
        }
    });

    await runner.test('Update Invalid Field', async () => {
        try {
            await api.put(`/tickets/${testTicketId}`, {
                field: 'invalid_field',
                value: 'test'
            });
            throw new Error('Should have thrown error for invalid field');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                // Expected behavior
            } else {
                throw error;
            }
        }
    });

    // Data Integrity Tests
    console.log(`\n${colors.yellow}>>> Data Integrity Tests${colors.reset}`);
    
    await runner.test('Verify Ticket Count in Stats', async () => {
        const tickets = await api.get('/tickets');
        const stats = await api.get('/stats');
        
        const activeCount = tickets.filter(t => t.status !== 'completed').length;
        const statsTotal = stats.marketing + stats.sales + stats.orders + stats.support;
        
        await runner.assertEqual(statsTotal, activeCount, 'Stats should match active ticket count');
    });

    await runner.test('Verify Timeline Chronology', async () => {
        const ticket = await api.get(`/tickets/${testTicketId}`);
        
        for (let i = 1; i < ticket.timeline.length; i++) {
            const prev = new Date(ticket.timeline[i - 1].created_at);
            const curr = new Date(ticket.timeline[i].created_at);
            
            if (curr < prev) {
                throw new Error('Timeline entries are not in chronological order');
            }
        }
    });

    // Performance Tests
    console.log(`\n${colors.yellow}>>> Performance Tests${colors.reset}`);
    
    await runner.test('Bulk Ticket Creation Performance', async () => {
        const startTime = Date.now();
        const promises = [];
        
        for (let i = 0; i < 10; i++) {
            promises.push(api.post('/tickets', {
                title: `Performance Test Ticket ${i}`,
                description: 'Testing bulk creation',
                pipeline: 'support',
                priority: 'medium'
            }));
        }
        
        await Promise.all(promises);
        const duration = Date.now() - startTime;
        
        await runner.assertTrue(duration < 5000, `Bulk creation should complete in <5s (took ${duration}ms)`);
        
        runner.logDecision('PERFORMANCE_TEST', 'Bulk Creation Test', 
            `Created 10 tickets in ${duration}ms`);
    });

    // Cleanup Tests
    console.log(`\n${colors.yellow}>>> Cleanup Tests${colors.reset}`);
    
    await runner.test('Delete Test Tickets', async () => {
        const tickets = await api.get('/tickets?search=Test');
        
        for (const ticket of tickets) {
            if (ticket.title.includes('Test')) {
                await api.delete(`/tickets/${ticket.id}`);
            }
        }
        
        const remainingTests = await api.get('/tickets?search=Test Ticket');
        await runner.assertEqual(remainingTests.length, 0, 'All test tickets should be deleted');
        
        runner.logDecision('CLEANUP', 'Test Tickets Removed', 
            `Cleaned up ${tickets.length} test tickets`);
    });

    // Final Summary
    const success = runner.summary();
    process.exit(success ? 0 : 1);
}

// Initialize Decision Log
function initializeDecisionLog() {
    if (!fs.existsSync(DECISION_LOG)) {
        const header = `# Project Decision Log
## Manufacturing Ticketing System

This document tracks all decisions, changes, and important events in the project lifecycle.

---

`;
        fs.writeFileSync(DECISION_LOG, header);
    }
}

// Run tests
if (require.main === module) {
    initializeDecisionLog();
    
    console.log(`${colors.cyan}Waiting for server to be ready...${colors.reset}`);
    
    // Wait for server to be ready
    setTimeout(async () => {
        try {
            await runTests();
        } catch (error) {
            console.error(`${colors.red}Fatal error running tests:${colors.reset}`, error);
            process.exit(1);
        }
    }, 2000);
}

module.exports = { TestRunner, APITester };
