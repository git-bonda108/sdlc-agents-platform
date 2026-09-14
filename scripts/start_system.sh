
#!/bin/bash

echo "🚀 Starting Enhanced Agentic AI SDLC System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r PREREQUISITES/requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp PREREQUISITES/.env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the system"
    exit 1
fi

# Create necessary directories
mkdir -p uploads chroma_db logs

# Start the API server
echo "Starting API server..."
cd API
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

# Start the frontend (if exists)
if [ -d "../UI" ]; then
    echo "Starting frontend..."
    cd ../UI
    if [ -f "package.json" ]; then
        npm install
        npm run dev &
        FRONTEND_PID=$!
    fi
fi

echo "✅ System started successfully!"
echo "📊 API: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "📚 API Docs: http://localhost:8000/docs"

# Wait for interrupt
trap 'kill $API_PID $FRONTEND_PID 2>/dev/null' EXIT
wait
