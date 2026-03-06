#!/bin/bash

# ============================================
# Migration Runner Script
# ============================================
# Run all migrations in order
# Usage: ./run-migrations.sh

set -e

DB_URL="${DATABASE_URL:-postgresql://localhost:5432/homelink}"
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Starting database migrations..."
echo "Database: $DB_URL"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
COMPLETED=0
FAILED=0

# Run each migration file in order
for migration_file in "$MIGRATIONS_DIR"/*.sql; do
    migration_name=$(basename "$migration_file")
    
    echo -e "${BLUE}Running: $migration_name${NC}"
    
    if psql "$DB_URL" -f "$migration_file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $migration_name${NC}"
        ((COMPLETED++))
    else
        echo -e "${RED}✗ $migration_name FAILED${NC}"
        ((FAILED++))
    fi
    echo ""
done

# Summary
echo "============================================"
echo "Migration Summary"
echo "============================================"
echo -e "${GREEN}Completed: $COMPLETED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All migrations completed successfully!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some migrations failed. Please review the errors above.${NC}"
    exit 1
fi
