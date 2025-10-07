import os
from dotenv import load_dotenv

# Load .env file from the Backend directory
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)


class Config:
    DATABASE_URL = os.getenv('DATABASE_URL')
    SECRET_KEY = os.getenv('SESSION_SECRET', 'dev-secret-key-change-in-production')

    # Add SSL configuration for Neon.tech
    if DATABASE_URL and 'neon.tech' in DATABASE_URL:
        # Ensure SSL mode is required and add connection timeout
        if 'sslmode=' not in DATABASE_URL:
            DATABASE_URL += '?sslmode=require'
        elif 'sslmode=prefer' in DATABASE_URL:
            DATABASE_URL = DATABASE_URL.replace('sslmode=prefer', 'sslmode=require')

    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is not set")