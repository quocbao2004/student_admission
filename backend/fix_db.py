import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def fix_db():
    with connection.cursor() as cursor:
        print("Adding 'rejection_reason' column to 'profiles' table...")
        try:
            cursor.execute("ALTER TABLE profiles ADD COLUMN rejection_reason TEXT;")
            print("Successfully added 'rejection_reason' column.")
        except Exception as e:
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    fix_db()
