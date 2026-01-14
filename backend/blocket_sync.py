"""
Blocket Sync Service
Fetches car listings from Blocket dealer page and saves to JSON
"""

import json
import os
import re
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data directory
DATA_DIR = Path(__file__).parent.parent / "data"
CARS_FILE = DATA_DIR / "cars.json"

# Blocket API endpoint (via blocket-api.se - third party service)
BLOCKET_API_BASE = "https://blocket-api.se/v1/search/car"


class BlocketSync:
    def __init__(self, dealer_id: str):
        self.dealer_id = dealer_id
        self.client = httpx.Client(
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json",
            },
            timeout=60.0
        )

    def fetch_dealer_listings(self) -> list[dict]:
        """Fetch all car listings from the dealer via blocket-api.se"""
        try:
            logger.info(f"Fetching listings for dealer {self.dealer_id}")

            response = self.client.get(
                BLOCKET_API_BASE,
                params={
                    "org_id": self.dealer_id,
                },
            )
            response.raise_for_status()

            data = response.json()

            # Handle different response formats
            if isinstance(data, list):
                listings = data
            elif isinstance(data, dict):
                # blocket-api.se returns "docs" key
                listings = data.get("docs", data.get("data", data.get("ads", data.get("results", []))))
                if not isinstance(listings, list):
                    listings = [data] if data else []
            else:
                listings = []

            logger.info(f"Fetched {len(listings)} listings")
            return listings

        except Exception as e:
            logger.error(f"Error fetching listings: {e}")
            return []

    def fetch_all_images(self, ad_id: str, canonical_url: str) -> list[str]:
        """Fetch all images for a car from the Blocket page"""
        try:
            url = canonical_url or f"https://www.blocket.se/mobility/item/{ad_id}"
            response = self.client.get(url)
            response.raise_for_status()

            # Extract all unique image URLs from the page
            pattern = r'https://images\.blocketcdn\.se/dynamic/default/item/[^"\'>\s]+'
            matches = re.findall(pattern, response.text)

            # Remove duplicates while preserving order
            seen = set()
            unique_images = []
            for img in matches:
                if img not in seen:
                    seen.add(img)
                    unique_images.append(img)

            logger.info(f"Found {len(unique_images)} images for ad {ad_id}")
            return unique_images

        except Exception as e:
            logger.error(f"Error fetching images for ad {ad_id}: {e}")
            return []

    def parse_listing(self, listing: dict) -> dict:
        """Parse a Blocket listing into our format (blocket-api.se format)"""
        # Extract ad ID
        ad_id = listing.get("ad_id", listing.get("id", ""))

        # Get canonical URL
        canonical_url = listing.get("canonical_url", f"https://www.blocket.se/mobility/item/{ad_id}")

        # Get all images from the Blocket page
        images = self.fetch_all_images(str(ad_id), canonical_url)

        # Fallback to main image if no images found
        if not images:
            image_data = listing.get("image", {})
            if isinstance(image_data, dict) and image_data.get("url"):
                images.append(image_data["url"])
            elif isinstance(image_data, str):
                images.append(image_data)

        # Get price
        price = listing.get("price", {})
        if isinstance(price, dict):
            price_value = price.get("amount", price.get("value", 0))
        else:
            price_value = price or 0

        try:
            price_value = int(price_value)
        except (ValueError, TypeError):
            price_value = 0

        # Get location
        location_name = listing.get("location", "")

        return {
            "id": str(ad_id),
            "blocket_url": canonical_url,
            "title": listing.get("heading", listing.get("subject", "")),
            "price": price_value,
            "currency": "SEK",
            "year": str(listing.get("year", "")),
            "mileage": str(listing.get("mileage", "")),
            "fuel_type": listing.get("fuel", ""),
            "transmission": listing.get("transmission", ""),
            "body_type": listing.get("registration_class", {}).get("value", "") if isinstance(listing.get("registration_class"), dict) else "",
            "color": "",
            "brand": listing.get("make", ""),
            "model": listing.get("model", ""),
            "engine_power": "",
            "location": location_name,
            "images": images,
            "description": listing.get("model_specification", ""),
            "regno": listing.get("regno", ""),
            "fetched_at": datetime.utcnow().isoformat(),
        }

    def sync(self) -> dict:
        """Perform full sync and save to file"""
        logger.info(f"Starting sync for dealer {self.dealer_id}")

        # Fetch listings
        raw_listings = self.fetch_dealer_listings()
        logger.info(f"Fetched {len(raw_listings)} raw listings")

        # Parse listings
        cars = [self.parse_listing(listing) for listing in raw_listings]

        # Prepare data
        data = {
            "dealer_id": self.dealer_id,
            "last_sync": datetime.utcnow().isoformat(),
            "count": len(cars),
            "cars": cars,
        }

        # Ensure data directory exists
        DATA_DIR.mkdir(parents=True, exist_ok=True)

        # Save to file
        with open(CARS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"Sync complete. Saved {len(cars)} cars to {CARS_FILE}")

        return data


def run_sync():
    """Run sync with dealer ID from environment"""
    from dotenv import load_dotenv
    load_dotenv()

    dealer_id = os.getenv("BLOCKET_DEALER_ID", "7514308")
    syncer = BlocketSync(dealer_id)
    return syncer.sync()


if __name__ == "__main__":
    run_sync()
