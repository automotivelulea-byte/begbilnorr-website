"""
FastAPI Backend for Begbilnorr Car Dealership
Serves car listings from synced Blocket data
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv

from blocket_sync import BlocketSync, CARS_FILE, DATA_DIR

load_dotenv()

app = FastAPI(
    title="Begbilnorr API",
    description="Car dealership API with automatic Blocket sync",
    version="1.0.0"
)

# CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Scheduler for automatic sync
scheduler = BackgroundScheduler()


def load_cars_data() -> dict:
    """Load cars data from JSON file"""
    if not CARS_FILE.exists():
        return {"dealer_id": "", "last_sync": None, "count": 0, "cars": []}

    with open(CARS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def scheduled_sync():
    """Scheduled sync task"""
    try:
        dealer_id = os.getenv("BLOCKET_DEALER_ID", "7514308")
        syncer = BlocketSync(dealer_id)
        syncer.sync()
    except Exception as e:
        print(f"Scheduled sync error: {e}")


@app.on_event("startup")
async def startup_event():
    """Start scheduler on app startup"""
    sync_interval = int(os.getenv("SYNC_INTERVAL_HOURS", "24"))

    # Schedule sync job
    scheduler.add_job(
        scheduled_sync,
        "interval",
        hours=sync_interval,
        id="blocket_sync",
        replace_existing=True
    )
    scheduler.start()

    # Run initial sync if no data exists
    if not CARS_FILE.exists():
        scheduled_sync()


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler"""
    scheduler.shutdown()


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "Begbilnorr API",
        "version": "1.0.0",
        "endpoints": {
            "cars": "/api/cars",
            "car_detail": "/api/cars/{car_id}",
            "sync_status": "/api/sync/status",
            "trigger_sync": "/api/sync/trigger"
        }
    }


@app.get("/api/cars")
async def get_cars(
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    min_year: Optional[int] = Query(None, description="Minimum year"),
    max_year: Optional[int] = Query(None, description="Maximum year"),
    fuel_type: Optional[str] = Query(None, description="Filter by fuel type"),
    transmission: Optional[str] = Query(None, description="Filter by transmission"),
    sort_by: Optional[str] = Query("price_asc", description="Sort: price_asc, price_desc, year_desc, mileage_asc"),
    limit: Optional[int] = Query(None, description="Limit results"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
):
    """Get all cars with optional filters"""
    data = load_cars_data()
    cars = data.get("cars", [])

    # Apply filters
    if brand:
        cars = [c for c in cars if brand.lower() in c.get("brand", "").lower()]

    if min_price is not None:
        cars = [c for c in cars if c.get("price", 0) >= min_price]

    if max_price is not None:
        cars = [c for c in cars if c.get("price", 0) <= max_price]

    if min_year is not None:
        cars = [c for c in cars if _parse_year(c.get("year", "")) >= min_year]

    if max_year is not None:
        cars = [c for c in cars if _parse_year(c.get("year", "")) <= max_year]

    if fuel_type:
        cars = [c for c in cars if fuel_type.lower() in c.get("fuel_type", "").lower()]

    if transmission:
        cars = [c for c in cars if transmission.lower() in c.get("transmission", "").lower()]

    # Sort
    if sort_by == "price_asc":
        cars.sort(key=lambda c: c.get("price", 0))
    elif sort_by == "price_desc":
        cars.sort(key=lambda c: c.get("price", 0), reverse=True)
    elif sort_by == "year_desc":
        cars.sort(key=lambda c: _parse_year(c.get("year", "")), reverse=True)
    elif sort_by == "mileage_asc":
        cars.sort(key=lambda c: _parse_mileage(c.get("mileage", "")))

    total = len(cars)

    # Pagination
    if limit:
        cars = cars[offset:offset + limit]
    elif offset:
        cars = cars[offset:]

    return {
        "total": total,
        "count": len(cars),
        "offset": offset,
        "last_sync": data.get("last_sync"),
        "cars": cars
    }


@app.get("/api/cars/{car_id}")
async def get_car(car_id: str):
    """Get a single car by ID"""
    data = load_cars_data()

    for car in data.get("cars", []):
        if car.get("id") == car_id:
            return car

    raise HTTPException(status_code=404, detail="Car not found")


@app.get("/api/filters")
async def get_filters():
    """Get available filter options based on current inventory"""
    data = load_cars_data()
    cars = data.get("cars", [])

    brands = sorted(set(c.get("brand", "") for c in cars if c.get("brand")))
    fuel_types = sorted(set(c.get("fuel_type", "") for c in cars if c.get("fuel_type")))
    transmissions = sorted(set(c.get("transmission", "") for c in cars if c.get("transmission")))
    body_types = sorted(set(c.get("body_type", "") for c in cars if c.get("body_type")))
    years = sorted(set(_parse_year(c.get("year", "")) for c in cars if c.get("year")))

    prices = [c.get("price", 0) for c in cars if c.get("price")]

    return {
        "brands": brands,
        "fuel_types": fuel_types,
        "transmissions": transmissions,
        "body_types": body_types,
        "years": years if years else [],
        "price_range": {
            "min": min(prices) if prices else 0,
            "max": max(prices) if prices else 0
        }
    }


@app.get("/api/sync/status")
async def sync_status():
    """Get sync status"""
    data = load_cars_data()

    return {
        "last_sync": data.get("last_sync"),
        "car_count": data.get("count", 0),
        "dealer_id": data.get("dealer_id"),
        "next_sync": "Scheduled every 24 hours"
    }


@app.post("/api/sync/trigger")
async def trigger_sync():
    """Manually trigger a sync"""
    try:
        dealer_id = os.getenv("BLOCKET_DEALER_ID", "7514308")
        syncer = BlocketSync(dealer_id)
        result = syncer.sync()

        return {
            "status": "success",
            "cars_synced": result.get("count", 0),
            "sync_time": result.get("last_sync")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _parse_year(year_str: str) -> int:
    """Parse year from string"""
    try:
        # Handle various formats like "2020", "2020-2021", etc
        return int(str(year_str).split("-")[0].strip()[:4])
    except (ValueError, IndexError):
        return 0


def _parse_mileage(mileage_str: str) -> int:
    """Parse mileage from string"""
    try:
        # Remove non-numeric characters except digits
        numbers = "".join(c for c in str(mileage_str) if c.isdigit())
        return int(numbers) if numbers else 999999
    except ValueError:
        return 999999


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))

    uvicorn.run(app, host=host, port=port)
