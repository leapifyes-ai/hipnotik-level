"""
Database and configuration module
"""
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "hipnotik_db")

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "hipnotik-secret-key-2024")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# CORS
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

# MongoDB client
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

def get_database():
    """Get database instance"""
    return db
