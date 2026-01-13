# Begbilnorr - Car Dealership Website

A modern car dealership website that automatically syncs listings from Blocket.

## Features

- **Automatic Blocket Sync**: Fetches car listings from your Blocket dealer page every 24 hours
- **Modern UI**: Built with Next.js and Tailwind CSS
- **Filtering**: Filter cars by brand, price, fuel type, transmission
- **Responsive**: Works on desktop, tablet, and mobile
- **Fast**: Server-side rendering with Next.js

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Blocket.se    │────▶│  Python Backend  │────▶│  Next.js        │
│  (Your Dealer)  │     │  (FastAPI)       │     │  Frontend       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────┐
                        │   cars.json  │
                        │   (data)     │
                        └──────────────┘
```

## Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Clone the repository
cd begbilnorr-website

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The website will be available at:
- Frontend: http://localhost:3000
- API: http://localhost:8000

### Option 2: Development Mode

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run the server
python main.py
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Run development server
npm run dev
```

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BLOCKET_DEALER_ID` | `7514308` | Your Blocket dealer ID |
| `SYNC_INTERVAL_HOURS` | `24` | How often to sync from Blocket |
| `API_HOST` | `0.0.0.0` | API host |
| `API_PORT` | `8000` | API port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:8000` | Backend API URL |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cars` | GET | Get all cars (with filters) |
| `/api/cars/{id}` | GET | Get single car |
| `/api/filters` | GET | Get available filter options |
| `/api/sync/status` | GET | Check sync status |
| `/api/sync/trigger` | POST | Manually trigger sync |

### Filter Parameters

```
GET /api/cars?brand=Volvo&min_price=50000&max_price=200000&fuel_type=Diesel&sort_by=price_asc
```

## Manual Sync

Trigger a manual sync via API:

```bash
curl -X POST http://localhost:8000/api/sync/trigger
```

Or run the sync script directly:

```bash
cd backend
python blocket_sync.py
```

## Production Deployment

### With Nginx (recommended)

1. Enable the production profile:
```bash
docker-compose --profile production up -d
```

2. Configure SSL certificates in `./ssl/`:
   - `fullchain.pem`
   - `privkey.pem`

3. Update `nginx.conf` to uncomment HTTPS configuration

### Without Docker

1. Set up a Python process manager (systemd/supervisor) for the backend
2. Build and run the Next.js frontend:
```bash
cd frontend
npm run build
npm start
```

3. Configure Nginx/Apache as reverse proxy

## Troubleshooting

### No cars showing

1. Check if backend is running: `curl http://localhost:8000/`
2. Check sync status: `curl http://localhost:8000/api/sync/status`
3. Trigger manual sync: `curl -X POST http://localhost:8000/api/sync/trigger`
4. Check logs: `docker-compose logs backend`

### Sync not working

1. Verify your dealer ID is correct
2. Check Blocket isn't blocking requests (may need to reduce sync frequency)
3. Check backend logs for errors

## License

MIT
