# Set PG_SCHEMA_DIFF_NON_INTERACTIVE to overpass interactive prompt
export PG_SCHEMA_DIFF_NON_INTERACTIVE=1

# Create solid database
pg-schema-diff apply --dsn "postgres://$PGUSER:$PGPASSWORD_FOR_DIFF@$PGHOST:$PGPORT/postgres" --schema-dir ./src/utils/database/sql/db --allow-hazards INDEX_BUILD
# Create tables if not exist
pg-schema-diff apply --dsn "postgres://$PGUSER:$PGPASSWORD_FOR_DIFF@$PGHOST:$PGPORT/$PGDATABASE" --schema-dir ./src/utils/database/sql/initTable --allow-hazards INDEX_BUILD HAS_UNTRACKABLE_DEPENDENCIES ACQUIRES_SHARE_ROW_EXCLUSIVE_LOCK DELETES_DATA

# Start solid backend
node ./dist/index.js
