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

## Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. The application will load with sample tickets

## Project Structure

```
ticketing-system/
├── server.js           # Backend server and API
├── package.json        # Dependencies and scripts
├── tickets.db          # SQLite database (created automatically)
├── public/
│   └── index.html      # Frontend application
└── README.md          # This file
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