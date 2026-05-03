# Adds season_id FK column to the unmanaged 'applications' table.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('admissions', '0004_create_admission_season'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE applications
                ADD COLUMN IF NOT EXISTS season_id UUID NULL
                REFERENCES admission_seasons(id) ON DELETE SET NULL;

                CREATE INDEX IF NOT EXISTS idx_applications_season_id
                ON applications(season_id);
            """,
            reverse_sql="""
                ALTER TABLE applications DROP COLUMN IF EXISTS season_id;
            """,
        ),
    ]
