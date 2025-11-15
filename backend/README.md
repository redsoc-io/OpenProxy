# OpenProxy Backend

## Setup

```bash
npm install
```

## Running

```bash
npm start
```

This starts:
- API server on port 3000 (or PORT env variable)
- Worker process that continuously:
  1. Fetches new proxies from configured sources
  2. Tests untested proxies
  3. Revalidates working proxies
  4. Updates the database every 5 minutes

## API Endpoints

- `GET /api/servers` - Get all working proxy servers
- `GET /api/proxy.pac` - Get PAC file for browser configuration

## Environment Variables

- `PORT` - API server port (default: 3000)
- `SQLITE_DIR` - Database directory (default: ../data)
