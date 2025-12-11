Alembic migrations directory stub. For the hackathon you can run with SQLite without migrations.
If you want to add migrations later, initialize alembic with:


alembic init alembic


and configure alembic.ini to use your DATABASE_URL.