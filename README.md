# Manufacturing Ticketing System - Setup Instructions

A full-stack ticketing system for manufacturing businesses with integrated pipeline management for Marketing, Sales/Quoting, Order Processing, and Customer Support.

## Features

- ✅ Multiple pipeline management (Marketing, Sales, Orders, Support)
- ✅ Real-time ticket filtering and search
- ✅ Status tracking (New, In Progress, Pending, Completed)
- ✅ Priority levels (High, Medium, Low)
- ✅ Activity timeline for each ticket
- ✅ Customer/contact tracking
- ✅ Assignment management
- ✅ SQLite database for persistent storage
- ✅ RESTful API backend
- ✅ Responsive web interface

## System Requirements

- Node.js (v14 or higher)
- npm (comes with Node.js)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## Installation

### 1. Install Node.js

If you don't have Node.js installed:
- Download from https://nodejs.org/
- Install the LTS (Long Term Support) version
- Verify installation: `node --version` and `npm --version`

### 2. Project Setup

Create your project directory and files:

```bash
mkdir ticketing-system
cd ticketing-system
```

### 3. Create Required Files

Create the following files in your project directory:

**File 1: `package.json`**
```json
{
  "name": "manufacturing-ticketing-system",
  "version": "1.0.0",
  "description": "Manufacturing business ticketing system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**File 2: `server.js`**
(Copy the complete backend server code provided)

**File 3: `public/index.html`**
(Copy the complete frontend HTML code provided)

### 4. Install Dependencies

Run the following command in your project directory:

```bash
npm install
```

This will install all required packages:
- `express` - Web server framework
- `sqlite3` - Database
- `cors` - Cross-origin resource sharing
- `nodemon` - Development tool (optional, for auto-restart)

## Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

### Running Tests

Automated tests verify all system functionality:

```bash
# Run tests once
npm test

# Run tests in watch mode (continuous)
npm run test:watch
```

See `TEST_README.md` for detailed testing documentation.

## Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. The application will load with sample tickets

## Project Structure

```
ticketing-system/
├── server.js              # Backend server and API
├── package.json           # Dependencies and scripts
├── tickets.db             # SQLite database (created automatically)
├── DECISION_LOG.md        # Project decisions and changes log
├── public/
│   └── index.html         # Frontend application
├── test/
│   └── test.js            # Automated test suite
├── README.md              # This file
├── TEST_README.md         # Testing documentation
└── DECISION_LOG_GUIDE.md  # Guide for decision logging
```

## Decision Log

This project maintains a comprehensive decision log in `DECISION_LOG.md` that tracks:

- Architecture decisions and rationale
- Feature additions and changes
- Bug fixes and resolutions
- Performance optimizations
- Test results and findings
- All significant project events

### Why We Log Decisions

- **Historical Record**: Understand why decisions were made
- **Knowledge Transfer**: Help new team members get up to speed
- **Audit Trail**: Maintain compliance and accountability
- **Team Communication**: Share decisions across the team
- **Continuous Improvement**: Learn from past decisions

### Viewing the Decision Log

```bash
# View the entire log
cat DECISION_LOG.md

# View recent entries
tail -n 50 DECISION_LOG.md

# Search for specific topics
grep "FEATURE" DECISION_LOG.md
```

See `DECISION_LOG_GUIDE.md` for complete documentation on using and maintaining the decision log.

## Quick Reference Commands

### Common Development Tasks

#### Update from GitHub and Restart

```bash
# Stop the server (Ctrl+C if running, or kill process)
# Linux/Mac: Find and kill the process
lsof -ti:3000 | xargs kill -9

# Windows: Find and kill the process
netstat -ano | findstr :3000
# Note the PID, then:
taskkill /PID <PID> /F

# Pull latest changes from GitHub
git pull origin main

# Install any new dependencies
npm install

# Run tests to verify everything works
npm test

# Start the server
npm start
```

#### Fresh Start (Clean Setup)

```bash
# Clone the repository (first time only)
git clone <repository-url>
cd ticketing-system

# Install dependencies
npm install

# Start server
npm start

# In a new terminal, run tests
npm test
```

#### Daily Workflow

```bash
# Morning: Update and check
git pull origin main
npm install
npm test

# If tests pass, start server
npm start

# Evening: Commit changes
git add .
git commit -m "Description of changes made"
git push origin main
```

#### Testing Workflow

```bash
# Run all tests once
npm test

# Run tests continuously (watches for changes)
npm run test:watch

# Run tests and view decision log
npm test && tail -n 50 DECISION_LOG.md
```

#### Server Management

```bash
# Start server (foreground)
npm start

# Start server in background (Linux/Mac)
npm start &

# Start server in background (Windows - use PM2)
npm install -g pm2
pm2 start server.js --name ticketing-system
pm2 list
pm2 logs ticketing-system
pm2 stop ticketing-system
pm2 restart ticketing-system

# Check if server is running
# Linux/Mac
curl http://localhost:3000/api/health

# Windows
curl.exe http://localhost:3000/api/health
# Or open in browser: http://localhost:3000/api/health
```

#### Git Operations

```bash
# Check current status
git status

# View recent changes
git log --oneline -10

# Create a new branch
git checkout -b feature-name

# Switch between branches
git checkout main
git checkout feature-name

# View changes before committing
git diff

# Discard local changes (CAREFUL!)
git reset --hard HEAD
git pull origin main

# Update from GitHub without losing local changes
git stash
git pull origin main
git stash pop
```

#### Database Management

```bash
# Backup database
cp tickets.db tickets_backup_$(date +%Y%m%d_%H%M%S).db

# Linux/Mac with date formatting
cp tickets.db "tickets_backup_$(date +%Y%m%d_%H%M%S).db"

# Windows
copy tickets.db tickets_backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db

# Reset database (delete and restart server to recreate)
rm tickets.db    # Linux/Mac
del tickets.db   # Windows
npm start        # Recreates with sample data

# View database contents (requires sqlite3 CLI)
sqlite3 tickets.db "SELECT * FROM tickets LIMIT 10;"
sqlite3 tickets.db "SELECT COUNT(*) FROM tickets;"
```

#### Troubleshooting Commands

```bash
# Server won't start - port already in use
# Linux/Mac
lsof -ti:3000 | xargs kill -9
netstat -tulpn | grep 3000

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Check Node.js version
node --version
npm --version

# Clear npm cache
npm cache clean --force
rm -rf node_modules    # Linux/Mac
rmdir /s node_modules  # Windows
npm install

# View server logs (if using PM2)
pm2 logs ticketing-system
pm2 logs ticketing-system --lines 100

# Test database connection
node -e "const sqlite3 = require('sqlite3'); const db = new sqlite3.Database('./tickets.db'); db.get('SELECT COUNT(*) as count FROM tickets', (err, row) => { console.log(err || 'Tickets:', row); });"
```

#### Network Configuration Commands

```bash
# Find your IP address
# Linux
ip addr show | grep inet

# Mac
ifconfig | grep inet

# Windows
ipconfig

# Test server from another machine
curl http://YOUR_IP:3000/api/health

# Allow firewall access (run as administrator)
# Linux (Ubuntu/Debian)
sudo ufw allow 3000/tcp
sudo ufw status

# Windows
netsh advfirewall firewall add rule name="Ticketing System" dir=in action=allow protocol=TCP localport=3000

# Mac
# System Preferences > Security & Privacy > Firewall > Firewall Options
# Add Node.js to allowed applications
```

#### Monitoring and Logs

```bash
# Monitor server logs in real-time (if using PM2)
pm2 logs ticketing-system --lines 50

# Check system resources
# Linux/Mac
top
htop  # If installed

# Windows
tasklist | findstr node

# View decision log
cat DECISION_LOG.md
tail -n 50 DECISION_LOG.md
grep "FEATURE" DECISION_LOG.md

# Count tickets in database
sqlite3 tickets.db "SELECT pipeline, status, COUNT(*) FROM tickets GROUP BY pipeline, status;"
```

#### Complete Refresh and Restart (Emergency)

```bash
# CAUTION: This will reset everything to GitHub state

# 1. Backup database (optional but recommended)
cp tickets.db tickets_backup_emergency.db

# 2. Stop server
lsof -ti:3000 | xargs kill -9  # Linux/Mac
# Or Ctrl+C if running in terminal

# 3. Discard all local changes
git fetch origin
git reset --hard origin/main

# 4. Clean dependencies
rm -rf node_modules package-lock.json
npm install

# 5. Reset database (optional)
rm tickets.db

# 6. Run tests
npm test

# 7. Start server
npm start

# 8. Verify in browser
# Open: http://localhost:3000
```

#### One-Liner Commands

```bash
# Quick update and restart
git pull && npm install && npm test && npm start

# Full refresh (no database reset)
git pull && rm -rf node_modules && npm install && npm test && npm start

# Backup, update, test, start
cp tickets.db tickets_backup.db && git pull && npm install && npm test && npm start

# Check everything is working
curl http://localhost:3000/api/health && curl http://localhost:3000/api/stats
```

### Scheduled Tasks (Automation)

#### Linux/Mac Cron Jobs

```bash
# Edit crontab
crontab -e

# Daily database backup at 2 AM
0 2 * * * cp /path/to/ticketing-system/tickets.db /path/to/backups/tickets_$(date +\%Y\%m\%d).db

# Auto-update and restart at 3 AM Sunday
0 3 * * 0 cd /path/to/ticketing-system && git pull && npm install && pm2 restart ticketing-system

# Run tests daily at 1 AM and log results
0 1 * * * cd /path/to/ticketing-system && npm test >> /path/to/logs/test_results.log 2>&1
```

#### Windows Task Scheduler

Create batch files and schedule them:

**backup.bat:**
```batch
@echo off
cd C:\ticketing-system
copy tickets.db "backups\tickets_%date:~-4,4%%date:~-10,2%%date:~-7,2%.db"
```

**update_restart.bat:**
```batch
@echo off
cd C:\ticketing-system
git pull origin main
npm install
pm2 restart ticketing-system
```

Schedule via Task Scheduler or command line:
```cmd
schtasks /create /tn "Backup Tickets DB" /tr "C:\ticketing-system\backup.bat" /sc daily /st 02:00
```

### Git Workflow Summary

```bash
# DAILY: Pull latest changes
git pull origin main

# BEFORE MAKING CHANGES: Create branch
git checkout -b my-feature-name

# WHILE WORKING: Commit frequently
git add .
git commit -m "Descriptive message"

# WHEN DONE: Push branch
git push origin my-feature-name

# Create pull request on GitHub, then after merge:
git checkout main
git pull origin main
git branch -d my-feature-name

# EMERGENCY: Undo last commit (keep changes)
git reset --soft HEAD~1

# EMERGENCY: Undo last commit (discard changes)
git reset --hard HEAD~1
```

## API Endpoints

### Tickets
- `GET /api/tickets` - Get all tickets (supports filtering)
- `GET /api/tickets/:id` - Get single ticket with timeline
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket field
- `DELETE /api/tickets/:id` - Delete ticket

### Statistics
- `GET /api/stats` - Get pipeline statistics

### Timeline
- `POST /api/tickets/:id/timeline` - Add timeline entry

### Health Check
- `GET /api/health` - Server health status

## Network Access Configuration

### Local Network Access

To access from other computers on your network:

1. Find your server's IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update the frontend API URL in `public/index.html`:
   ```javascript
   const API_URL = 'http://YOUR_SERVER_IP:3000/api';
   ```

3. Access from other devices using:
   ```
   http://YOUR_SERVER_IP:3000
   ```

### Firewall Configuration

Make sure port 3000 is open in your firewall:

**Windows:**
```powershell
netsh advfirewall firewall add rule name="Ticketing System" dir=in action=allow protocol=TCP localport=3000
```

**Linux (ufw):**
```bash
sudo ufw allow 3000/tcp
```

## Database Management

The SQLite database (`tickets.db`) is created automatically when you first run the server.

### Backup Database

```bash
# Copy the database file
cp tickets.db tickets_backup_$(date +%Y%m%d).db
```

### Reset Database

```bash
# Stop the server
# Delete the database file
rm tickets.db
# Restart the server (will create fresh database with sample data)
npm start
```

## Customization

### Change Port Number

Edit `server.js`:
```javascript
const PORT = 3000; // Change to your desired port
```

### Modify Sample Data

Edit the `insertSampleData()` function in `server.js` to customize initial tickets.

### Update Styling

The frontend styles are in the `<style>` section of `public/index.html`. Modify colors, fonts, and layout as needed.

## Troubleshooting

### Server Won't Start

1. Check if port 3000 is already in use:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Mac/Linux
   lsof -i :3000
   ```

2. Kill the process or change the port in `server.js`

### Cannot Connect from Browser

1. Verify server is running: check console output
2. Check firewall settings
3. Verify correct URL and port
4. Check browser console for errors (F12)

### Database Errors

1. Ensure write permissions in project directory
2. Check disk space
3. Delete and recreate `tickets.db` if corrupted

### CORS Issues

If accessing from a different domain, the CORS middleware is already configured. Ensure it's enabled in `server.js`.

## Production Deployment

For production use on your local network:

1. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name ticketing-system
   pm2 startup  # Enable auto-start on boot
   pm2 save
   ```

2. **Set up automatic backups:**
   Create a cron job (Linux/Mac) or scheduled task (Windows) to backup the database regularly.

3. **Configure environment variables:**
   Create a `.env` file for configuration:
   ```
   PORT=3000
   NODE_ENV=production
   ```

4. **Add user authentication** (recommended for production):
   Consider adding authentication middleware for secure access.

## Support and Maintenance

### Regular Maintenance

1. Backup database weekly
2. Monitor disk space
3. Check logs for errors
4. Update dependencies periodically: `npm update`

### Adding New Features

The system is designed to be extensible:
- Add new pipelines by updating the frontend and database schema
- Add custom fields to tickets by modifying the database schema
- Implement email notifications by adding a notification service
- Add file attachments using a file upload middleware

## License

MIT License - Free to use and modify for your business needs.

## Questions?

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for frontend errors
4. Check server console for backend errors
