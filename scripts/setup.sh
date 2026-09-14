
#!/bin/bash

echo "🔧 Setting up Enhanced Agentic AI SDLC System..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Check Node.js version (if available)
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "Node.js version: $node_version"
fi

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r PREREQUISITES/requirements.txt

# Create environment file
if [ ! -f ".env" ]; then
    cp PREREQUISITES/.env.example .env
    echo "✅ Created .env file from template"
fi

# Create necessary directories
mkdir -p uploads chroma_db logs
echo "✅ Created necessary directories"

# Set up database (SQLite by default)
echo "Setting up database..."
python -c "
from sqlalchemy import create_engine
from MODELS.database import Base
engine = create_engine('sqlite:///./sdlc_system.db')
Base.metadata.create_all(bind=engine)
print('✅ Database initialized')
"

# Make scripts executable
chmod +x scripts/*.sh
echo "✅ Made scripts executable"

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: ./scripts/start_system.sh"
echo "3. Visit: http://localhost:8000/docs for API documentation"
