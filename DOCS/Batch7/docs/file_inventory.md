
# SDLC System - Complete File Inventory

## Overview
This document provides a comprehensive inventory of all files in the SDLC System, their purposes, and interdependencies.

## Backend Structure

### Core Application Files
- **`backend/main.py`**: Main FastAPI application entry point with lifespan management
- **`backend/core/config.py`**: Centralized configuration management using Pydantic settings
- **`backend/core/database.py`**: Database connection, session management, and initialization

### API Layer
- **`backend/api/routes.py`**: Main API router aggregating all endpoint modules
- **`backend/api/endpoints/`**: Individual API endpoint modules
  - **`projects.py`**: Project CRUD operations and management
  - **`rag.py`**: RAG system document upload, query, and management
  - **`agents.py`**: Multi-agent task creation and monitoring
  - **`collaboration.py`**: HITL collaboration and WebSocket endpoints
  - **`visualization.py`**: Chart generation and dashboard data
  - **`export.py`**: Export functionality for projects and reports

### Business Logic
- **`backend/services/`**: Service layer containing business logic
- **`backend/models/`**: SQLAlchemy database models
- **`backend/schemas/`**: Pydantic schemas for API validation
- **`backend/utils/`**: Utility functions and helpers

### Integration Components
- **`backend/integrations/`**: External service integrations
- **`backend/orchestration/`**: CrewAI multi-agent orchestration
- **`backend/task_system/`**: Task management and execution

### Testing
- **`backend/tests/test_integration.py`**: Comprehensive integration tests
- **`backend/tests/test_api_health.py`**: API health check validation

## Configuration Files

### Docker & Deployment
- **`docker-compose.yml`**: Multi-service Docker orchestration
- **`Dockerfile`**: Application container definition
- **`.env.example`**: Environment configuration template

### Dependencies
- **`requirements.txt`**: Complete Python package dependencies

## Automation Scripts
- **`scripts/setup.sh`**: System setup and initialization
- **`scripts/start.sh`**: Application startup with multiple deployment options
- **`scripts/test.sh`**: Comprehensive testing automation

## Documentation
- **`README.md`**: Complete system documentation and quick start guide
- **`docs/migration_guide.md`**: Detailed migration and deployment guide
- **`docs/file_inventory.md`**: This file - complete file inventory

## Frontend Structure (Optional)
- **`frontend/src/`**: React application source code
- **`frontend/components/`**: Reusable UI components
- **`frontend/public/`**: Static assets and public files

## Key Features Integrated

### 1. RAG System
- ChromaDB integration for vector storage
- Document processing and embedding
- Intelligent query and retrieval

### 2. Multi-Agent System
- CrewAI orchestration framework
- Specialized agent roles and tasks
- Automated workflow execution

### 3. Human-in-the-Loop Collaboration
- Real-time WebSocket communication
- Feedback integration and processing
- Collaborative session management

### 4. Visualization & Reporting
- Interactive dashboard generation
- Custom chart creation with Plotly
- Export capabilities (PDF, DOCX, XLSX)

### 5. Complete SDLC Management
- Project lifecycle tracking
- Phase-based workflow management
- Team collaboration tools

## Deployment Options

### Local Development
- Python virtual environment setup
- SQLite database for development
- Local ChromaDB instance

### Docker Deployment
- Multi-container orchestration
- PostgreSQL database
- Redis caching layer
- Nginx reverse proxy

### Production Configuration
- Environment-based configuration
- Security hardening
- Performance optimization
- Monitoring and logging

## Dependencies and Integrations

### Core Dependencies
- **FastAPI**: Web framework and API development
- **SQLAlchemy**: Database ORM and migrations
- **ChromaDB**: Vector database for RAG
- **CrewAI**: Multi-agent orchestration
- **Plotly**: Visualization and charting

### External Services
- **OpenAI API**: Language model integration
- **PostgreSQL**: Production database
- **Redis**: Caching and session storage

## File Relationships

### Import Dependencies
- Main application imports from core, api, and services
- API endpoints depend on services and schemas
- Services utilize models and external integrations
- Tests import from all application modules

### Configuration Flow
- Environment variables → core/config.py → application modules
- Database configuration → models → services → API endpoints
- Service dependencies injected through FastAPI dependency system

## Maintenance and Updates

### Regular Maintenance
- Dependency updates in requirements.txt
- Database migrations through Alembic
- Log rotation and cleanup
- Performance monitoring

### Version Control
- All source code tracked in Git
- Environment files excluded (.env)
- Build artifacts ignored (node_modules, __pycache__)

This inventory represents a complete, production-ready SDLC system with all components integrated and validated.
