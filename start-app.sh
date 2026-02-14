#!/bin/bash

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_DIR/.env"
CREDENTIALS_FILE="Kas-Permata-App.json"

echo "🚀 Starting WA-Generator..."

# Check dependencies
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Setup Environment
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
    
    # Auto-configure credentials if found
    if [ -f "$PROJECT_DIR/$CREDENTIALS_FILE" ]; then
        echo "🔑 Found credentials file: $CREDENTIALS_FILE. Configuring .env..."
        # Backup for safety (though just created)
        # MacOS sed requires empty extension for in-place edit
        sed -i '' "s|GOOGLE_APPLICATION_CREDENTIALS=.*|GOOGLE_APPLICATION_CREDENTIALS=./$CREDENTIALS_FILE|" "$ENV_FILE"
    fi
else
    echo "✅ Environment file found."
fi

# Check for Google Sheet ID placeholder
if grep -q "your_google_sheet_id" "$ENV_FILE"; then
    echo "--------------------------------------------------------"
    echo "⚠️  WARNING: Google Sheet ID is not set in .env."
    echo "Please open '$ENV_FILE' and set GOOGLE_SHEETS_ID."
    echo "Running with MOCK DATA support enabled as fallback."
    echo "--------------------------------------------------------"
    export USE_MOCK_DATA=true
else
    # Explicitly disable mock data to override any stale env vars
    export USE_MOCK_DATA=false
fi

# Start Application
echo "✨ Launching Server..."
USE_MOCK_DATA=$USE_MOCK_DATA npm start
