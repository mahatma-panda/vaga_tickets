const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./tickets.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Tickets table
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        customer TEXT,
        pipeline TEXT NOT NULL,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        assigned_to TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Timeline table for activity tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT NOT NULL,
        action TEXT NOT NULL,
        user TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_pipeline ON tickets(pipeline)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_timeline_ticket ON timeline(ticket_id)`);

    console.log('Database tables initialized');
    
    // Insert sample data if tickets table is empty
    db.get('SELECT COUNT(*) as count FROM tickets', (err, row) => {
      if (!err && row.count === 0) {
        insertSampleData();
      }
    });
  });
}

// Insert sample data
function insertSampleData() {
  const sampleTickets = [
    {
      id: 'TKT-001',
      title: 'New Product Launch Campaign',
      description: 'Plan and execute marketing campaign for new CNC machine line',
      customer: 'Internal Marketing',
      pipeline: 'marketing',
      status: 'in-progress',
      priority: 'high',
      assigned_to: 'Sarah Johnson'
    },
    {
      id: 'TKT-002',
      title: 'Quote Request - Custom Tooling',
      description: 'Customer needs quote for custom tooling for automotive parts manufacturing',
      customer: 'Acme Manufacturing Co.',
      pipeline: 'sales',
      status: 'pending',
      priority: 'high',
      assigned_to: 'Mike Chen'
    },
    {
      id: 'TKT-003',
      title: 'Process Order #5542',
      description: 'Rush order for 500 precision components',
      customer: 'TechParts Inc.',
      pipeline: 'orders',
      status: 'in-progress',
      priority: 'high',
      assigned_to: 'Production Team'
    },
    {
      id: 'TKT-004',
      title: 'Equipment Malfunction Report',
      description: 'Customer reporting issues with recently delivered milling machine',
      customer: 'Precision Metals Ltd.',
      pipeline: 'support',
      status: 'new',
      priority: 'high',
      assigned_to: 'Support Team'
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO tickets (id, title, description, customer, pipeline, status, priority, assigned_to)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  sampleTickets.forEach(ticket => {
    stmt.run([
      ticket.id,
      ticket.title,
      ticket.description,
      ticket.customer,
      ticket.pipeline,
      ticket.status,
      ticket.priority,
      ticket.assigned_to
    ]);

    // Add initial timeline entry
    db.run(
      'INSERT INTO timeline (ticket_id, action, user) VALUES (?, ?, ?)',
      [ticket.id, 'Ticket created', 'System']
    );
  });

  stmt.finalize();
  console.log('Sample data inserted');
}

// API Routes

// Get all tickets with optional filters
app.get('/api/tickets', (req, res) => {
  const { pipeline, status, search } = req.query;
  
  let query = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];

  if (pipeline && pipeline !== 'all') {
    query += ' AND pipeline = ?';
    params.push(pipeline);
  }

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ` AND (
      title LIKE ? OR 
      description LIKE ? OR 
      customer LIKE ? OR 
      id LIKE ?
    )`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single ticket with timeline
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, ticket) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Get timeline
    db.all(
      'SELECT * FROM timeline WHERE ticket_id = ? ORDER BY created_at ASC',
      [id],
      (err, timeline) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ ...ticket, timeline });
      }
    );
  });
});

// Create new ticket
app.post('/api/tickets', (req, res) => {
  const { title, description, customer, pipeline, priority, assigned_to } = req.body;

  // Validate required fields
  if (!title || !description || !pipeline || !priority) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Generate ticket ID
  db.get('SELECT MAX(CAST(SUBSTR(id, 5) AS INTEGER)) as max_num FROM tickets', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const nextNum = (row.max_num || 0) + 1;
    const ticketId = `TKT-${String(nextNum).padStart(3, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO tickets (id, title, description, customer, pipeline, status, priority, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      [ticketId, title, description, customer, pipeline, 'new', priority, assigned_to],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Add timeline entry
        db.run(
          'INSERT INTO timeline (ticket_id, action, user) VALUES (?, ?, ?)',
          [ticketId, 'Ticket created', 'Current User']
        );

        // Return the created ticket
        db.get('SELECT * FROM tickets WHERE id = ?', [ticketId], (err, ticket) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(ticket);
        });
      }
    );

    stmt.finalize();
  });
});

// Update ticket
app.put('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { field, value, oldValue } = req.body;

  if (!field || value === undefined) {
    res.status(400).json({ error: 'Missing field or value' });
    return;
  }

  // Validate field
  const allowedFields = ['pipeline', 'status', 'priority', 'assigned_to', 'title', 'description', 'customer'];
  if (!allowedFields.includes(field)) {
    res.status(400).json({ error: 'Invalid field' });
    return;
  }

  const query = `UPDATE tickets SET ${field} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

  db.run(query, [value, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    // Add timeline entry
    const fieldNames = {
      pipeline: 'Pipeline',
      status: 'Status',
      priority: 'Priority',
      assigned_to: 'Assigned To',
      title: 'Title',
      description: 'Description',
      customer: 'Customer'
    };

    const action = oldValue 
      ? `${fieldNames[field]} changed from "${oldValue}" to "${value}"`
      : `${fieldNames[field]} updated to "${value}"`;

    db.run(
      'INSERT INTO timeline (ticket_id, action, user) VALUES (?, ?, ?)',
      [id, action, 'Current User']
    );

    // Return updated ticket
    db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, ticket) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(ticket);
    });
  });
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    // Delete timeline entries first (due to foreign key)
    db.run('DELETE FROM timeline WHERE ticket_id = ?', [id]);
    
    // Delete ticket
    db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (this.changes === 0) {
        res.status(404).json({ error: 'Ticket not found' });
        return;
      }

      res.json({ message: 'Ticket deleted successfully' });
    });
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {};

  db.serialize(() => {
    const queries = [
      { key: 'marketing', query: "SELECT COUNT(*) as count FROM tickets WHERE pipeline = 'marketing' AND status != 'completed'" },
      { key: 'sales', query: "SELECT COUNT(*) as count FROM tickets WHERE pipeline = 'sales' AND status != 'completed'" },
      { key: 'orders', query: "SELECT COUNT(*) as count FROM tickets WHERE pipeline = 'orders' AND status != 'completed'" },
      { key: 'support', query: "SELECT COUNT(*) as count FROM tickets WHERE pipeline = 'support' AND status != 'completed'" },
      { key: 'total', query: "SELECT COUNT(*) as count FROM tickets" }
    ];

    let completed = 0;

    queries.forEach(({ key, query }) => {
      db.get(query, (err, row) => {
        if (!err) {
          stats[key] = row.count;
        }
        completed++;
        
        if (completed === queries.length) {
          res.json(stats);
        }
      });
    });
  });
});

// Add timeline entry
app.post('/api/tickets/:id/timeline', (req, res) => {
  const { id } = req.params;
  const { action, user } = req.body;

  if (!action || !user) {
    res.status(400).json({ error: 'Missing action or user' });
    return;
  }

  db.run(
    'INSERT INTO timeline (ticket_id, action, user) VALUES (?, ?, ?)',
    [id, action, user],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      db.get(
        'SELECT * FROM timeline WHERE id = ?',
        [this.lastID],
        (err, entry) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.status(201).json(entry);
        }
      );
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});