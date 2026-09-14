
# SDLC System - Complete Integrated Solution

A comprehensive Software Development Life Cycle management system integrating RAG capabilities, multi-agent orchestration, human-in-the-loop collaboration, and rich visualization.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Docker & Docker Compose (optional)
- Git

### Installation

1. **Clone and Setup**
   ```bash
   cd ~/Batches/Batch7
   chmod +x scripts/*.sh
   ./scripts/setup.sh
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the System**
   ```bash
   # Option 1: Python development
   ./scripts/start.sh
   
   # Option 2: Docker deployment
   ./scripts/start.sh docker
   ```

4. **Access the Application**
   - Main Application: http://localhost:8000
   - API Documentation: http://localhost:8000/docs
   - ChromaDB: http://localhost:8001

## 🏗️ Architecture

### Core Components

- **Backend**: FastAPI-based REST API with async support
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Vector DB**: ChromaDB for RAG capabilities
- **Frontend**: React-based dashboard (optional)
- **Cache**: Redis for session management
- **Orchestration**: CrewAI for multi-agent workflows

### Key Features

1. **Project Management**
   - Complete SDLC phase tracking
   - Task and milestone management
   - Team collaboration tools

2. **RAG System**
   - Document upload and processing
   - Intelligent query and retrieval
   - Context-aware responses

3. **Multi-Agent System**
   - CrewAI orchestration
   - Specialized agent roles
   - Automated task execution

4. **Human-in-the-Loop**
   - Real-time collaboration
   - Feedback integration
   - WebSocket communication

5. **Visualization & Reporting**
   - Interactive dashboards
   - Custom chart generation
   - Export capabilities

## 📁 Project Structure

```
Batch7/
├── backend/                 # Python backend application
│   ├── main.py             # FastAPI application entry point
│   ├── core/               # Core configuration and database
│   ├── api/                # API routes and endpoints
│   ├── services/           # Business logic services
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   ├── utils/              # Utility functions
│   └── tests/              # Test suites
├── frontend/               # React frontend (optional)
├── docker/                 # Docker configurations
├── docs/                   # Documentation
├── scripts/                # Automation scripts
├── config/                 # Configuration files
├── docker-compose.yml      # Multi-service setup
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Application
DEBUG=false
HOST=0.0.0.0
PORT=8000

# Database
DATABASE_URL=sqlite:///./sdlc_system.db

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8001

# API Keys
OPENAI_API_KEY=your_key_here
CREW_AI_API_KEY=your_key_here
```

### Database Setup

The system supports both SQLite (development) and PostgreSQL (production):

```bash
# SQLite (default)
DATABASE_URL=sqlite:///./sdlc_system.db

# PostgreSQL
DATABASE_URL=postgresql://user:pass@localhost:5432/sdlc_db
```

## 🧪 Testing

Run the complete test suite:

```bash
./scripts/test.sh
```

Individual test commands:
```bash
# Unit tests
pytest backend/tests/ -v

# Integration tests
pytest backend/tests/test_integration.py -v

# API health check
python backend/tests/test_api_health.py

# Code quality
ruff check backend/
black backend/ --check
mypy backend/
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

Services included:
- SDLC Application (port 8000)
- PostgreSQL Database (port 5432)
- ChromaDB Vector Database (port 8001)
- Redis Cache (port 6379)
- Nginx Reverse Proxy (ports 80/443)

## 📊 API Documentation

### Core Endpoints

- **Projects**: `/api/v1/projects/`
- **RAG System**: `/api/v1/rag/`
- **Agents**: `/api/v1/agents/`
- **Collaboration**: `/api/v1/collaboration/`
- **Visualization**: `/api/v1/visualization/`
- **Export**: `/api/v1/export/`

### WebSocket Endpoints

- **Collaboration**: `/api/v1/collaboration/ws/{session_id}`

Full API documentation available at: http://localhost:8000/docs

## 🔍 Monitoring & Logging

### Log Files
- Application logs: `logs/sdlc_system.log`
- ChromaDB logs: `logs/chroma.log`
- Error logs: `logs/error.log`

### Health Checks
```bash
curl http://localhost:8000/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8000
   # Kill the process or change PORT in .env
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose ps postgres
   # Reset database
   docker-compose down -v && docker-compose up -d
   ```

3. **ChromaDB Connection Issues**
   ```bash
   # Restart ChromaDB
   docker-compose restart chromadb
   ```

### Performance Optimization

1. **Database Optimization**
   - Use PostgreSQL for production
   - Enable connection pooling
   - Add database indexes

2. **Caching**
   - Enable Redis caching
   - Configure cache TTL appropriately

3. **Resource Limits**
   - Set appropriate Docker memory limits
   - Configure worker processes

## 📚 Documentation

- **Migration Guide**: `docs/migration_guide.md`
- **API Reference**: http://localhost:8000/docs
- **Architecture Diagram**: `docs/architecture.md`
- **Deployment Guide**: `docs/deployment.md`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `./scripts/test.sh`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting section above
- Review the migration guide in `docs/`
- Check logs in the `logs/` directory
- Ensure all environment variables are properly configured

## 🎯 Next Steps

After successful deployment:

1. **Configure API Keys**: Add your OpenAI and CrewAI API keys
2. **Upload Documents**: Use the RAG system to upload project documents
3. **Create Projects**: Start managing your SDLC projects
4. **Set Up Agents**: Configure multi-agent workflows
5. **Enable Collaboration**: Set up HITL collaboration sessions
6. **Generate Reports**: Create visualizations and export reports

---

**Version**: 1.0.0  
**Last Updated**: June 2025  
**Status**: Production Ready ✅
