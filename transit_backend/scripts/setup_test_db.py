#!/usr/bin/env python
"""
Test Database Setup Script

This script creates and configures a test database to resolve database conflicts during testing.
Usage: python scripts/setup_test_db.py
"""

import os
import sys
import django
import traceback

# Add project root directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "transit_backend.settings")

# Initialize Django
try:
    django.setup()
except Exception as e:
    print(f"Error initializing Django: {e}")
    traceback.print_exc()
    sys.exit(1)

# Import from Django settings
try:
    from django.conf import settings
except ImportError as e:
    print(f"Error importing Django settings: {e}")
    sys.exit(1)

# Database configuration
try:
    DB_NAME = settings.DATABASES['default']['NAME']
    DB_USER = settings.DATABASES['default']['USER']
    DB_PASSWORD = settings.DATABASES['default']['PASSWORD']
    DB_HOST = settings.DATABASES['default']['HOST']
    DB_PORT = settings.DATABASES['default']['PORT']
except KeyError as e:
    print(f"Error accessing database settings: {e}")
    print("Please check your Django settings file.")
    sys.exit(1)

# Test database name
TEST_DB_NAME = f"test_{DB_NAME}"

def create_test_db():
    """Create test database"""
    try:
        # Try to import psycopg2
        try:
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
        except ImportError:
            print("Error: psycopg2 module not found. Installing...")
            import subprocess
            subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2"])
            import psycopg2
            from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
            print("psycopg2 installed successfully.")
        
        # Connect to PostgreSQL
        print(f"Connecting to PostgreSQL at {DB_HOST}:{DB_PORT}...")
        conn = psycopg2.connect(
            dbname="postgres",
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if test database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{TEST_DB_NAME}'")
        exists = cursor.fetchone()
        
        # If exists, delete it
        if exists:
            print(f"Deleting existing test database: {TEST_DB_NAME}")
            cursor.execute(f"DROP DATABASE {TEST_DB_NAME}")
        
        # Create new test database
        print(f"Creating new test database: {TEST_DB_NAME}")
        cursor.execute(f"CREATE DATABASE {TEST_DB_NAME} OWNER {DB_USER}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("Test database created successfully!")
        return True
    except Exception as e:
        print(f"Error creating test database: {e}")
        traceback.print_exc()
        return False

def setup_test_env():
    """Set up test environment variables"""
    os.environ["DJANGO_SETTINGS_MODULE"] = "transit_backend.settings"
    os.environ["TEST_DATABASE_NAME"] = TEST_DB_NAME
    print("Test environment variables set successfully!")

def main():
    """Main function"""
    print("Starting test database setup...")
    if create_test_db():
        setup_test_env()
        print("\nTest database setup complete!")
        print(f"Test database name: {TEST_DB_NAME}")
        print("\nRun test command: python manage.py test")
    else:
        print("\nTest database setup failed!")
        sys.exit(1)

if __name__ == "__main__":
    main() 