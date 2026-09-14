
# SDLC Agentic AI - RAG Integration (Batch 3B)

## Overview

Batch 3B provides enhanced versions of existing SDLC files that seamlessly integrate with the RAG (Retrieval-Augmented Generation) components from Batch 3. This integration enables the SDLC system to leverage document knowledge and contextual information to provide more informed and accurate responses during each phase of the software development lifecycle.

## Key Integration Features

### 🤖 RAG-Enhanced AI Responses
- **Contextual Understanding**: AI agents now access relevant documentation and knowledge base
- **Improved Accuracy**: Responses are grounded in actual project documentation and best practices
- **Phase-Specific Context**: Each SDLC phase retrieves relevant documents automatically

### 📚 Document Management
- **Multi-Format Support**: PDF, DOCX, TXT, XLSX, CSV, MD files
- **Intelligent Chunking**: Semantic and fixed-size chunking strategies
- **Real-time Indexing**: Documents are processed and indexed immediately upon upload

### 🔍 Advanced Search & Retrieval
- **Semantic Search**: Find relevant content based on meaning, not just keywords
- **Hybrid Search**: Combines semantic and keyword-based search for optimal results
- **Query Expansion**: Automatically expands queries for better document retrieval

### 📊 Enhanced UI Experience
- **Document Upload Interface**: Drag-and-drop document upload with progress tracking
- **RAG Status Indicators**: Real-time status of ChromaDB and document indexing
- **Context Visualization**: View retrieved documents and their relevance scores
- **Search Testing Interface**: Test RAG search functionality directly from the UI

## Modified Files

### 1. Enhanced UI (`ui.py`)
**New Features:**
- RAG document upload section in sidebar
- ChromaDB status indicators
- Document management interface
- RAG search testing interface
- Progress feedback for document processing

**Key Functions:**
- `display_rag_section()`: Complete RAG management interface
- `process_uploaded_documents()`: Handle document upload and processing
- `display_document_management()`: Manage indexed documents
- `display_rag_search_interface()`: Test RAG search functionality

### 2. Modified Main Application (`main_sdlc_agentic_ai.py`)
**New Features:**
- RAG service initialization during startup
- ChromaDB client setup
- Document processing pipeline integration
- RAG status display in main interface

**Key Components:**
- `RAGService` class: Wrapper for all RAG functionality
- `initialize_rag_service()`: Initialize RAG components with error handling
- Enhanced error handling and logging for RAG operations

### 3. Updated Manager (`manager.py`)
**New Features:**
- RAG context retrieval in `run_phase()` method
- Document search before agent execution
- Enhanced conversation history with RAG context
- RAG-specific audit logging

**Key Methods:**
- `_retrieve_rag_context()`: Get relevant documents for current phase
- `_create_enhanced_query()`: Create phase-specific search queries
- Enhanced `run_phase()` with RAG integration
- RAG status reporting methods

### 4. Enhanced Configuration (`config.py`, `manager_config.yaml`)
**New Features:**
- Complete RAG configuration section
- ChromaDB settings and parameters
- Embedding model configuration
- Document processing settings
- Performance and monitoring options

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file with the following variables:
```bash
# Existing SDLC Configuration
ABACUS_API_KEY=your_api_key
ABACUS_DEPLOYMENT_TOKEN=your_token
ABACUS_DEPLOYMENT_ID=your_deployment_id
JIRA_SERVER=your_jira_server
JIRA_USERNAME=your_username
JIRA_API_TOKEN=your_api_token

# RAG Configuration
RAG_ENABLED=true
CHROMA_PERSIST_DIR=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
RAG_TOP_K=10
```

### 3. Initialize ChromaDB
The system will automatically create the ChromaDB directory and initialize collections on first run.

### 4. Upload Documents
Use the sidebar interface to upload relevant documents:
- Project requirements
- Technical specifications
- API documentation
- Best practices guides
- Previous project artifacts

## Usage Guide

### 1. Starting the Application
```bash
streamlit run main_sdlc_agentic_ai.py
```

### 2. Document Upload Process
1. Navigate to the "RAG Document Management" section in the sidebar
2. Click "Upload Documents" and select your files
3. Click "Process Documents" to index them
4. Monitor the progress bar for processing status

### 3. RAG-Enhanced Phase Execution
1. Select your desired SDLC phase
2. Enter your prompt/requirements
3. Click "Run [Phase] Phase"
4. The system will:
   - Search for relevant documents
   - Retrieve contextual information
   - Enhance the AI response with document knowledge
   - Display retrieved context in an expandable section

### 4. Testing RAG Search
Use the "Test RAG Search" interface in the sidebar to:
- Test search queries
- Verify document indexing
- Understand retrieval quality

## Configuration Options

### ChromaDB Settings
```yaml
rag:
  chromadb:
    persist_directory: "./chroma_db"
    collection_prefix: "sdlc_"
    distance_function: "cosine"
    max_collections: 10
```

### Embedding Configuration
```yaml
rag:
  embedding:
    model_name: "all-MiniLM-L6-v2"
    dimension: 384
    normalize_embeddings: true
    batch_size: 32
```

### Retrieval Settings
```yaml
rag:
  retrieval:
    top_k: 10
    similarity_threshold: 0.5
    rerank_top_k: 5
    enable_query_expansion: true
```

## Monitoring & Troubleshooting

### RAG Status Indicators
- **🟢 Connected**: ChromaDB is operational
- **🔴 Disconnected**: ChromaDB connection issues
- **⚠️ Warning**: Partial functionality available

### Common Issues

1. **ChromaDB Connection Failed**
   - Check persist directory permissions
   - Verify disk space availability
   - Review error logs

2. **Document Processing Errors**
   - Verify file format support
   - Check file size limits (default: 50MB)
   - Ensure sufficient memory

3. **Poor Search Results**
   - Adjust similarity threshold
   - Increase top_k parameter
   - Review document quality and relevance

### Logging
RAG operations are logged with the following events:
- `rag_context_retrieved`: When documents are found for a query
- `phase_approved`: When phases are approved with RAG context
- `project_reset`: When the project is reset

## Performance Optimization

### Memory Management
- Configure `max_memory_size` based on available RAM
- Enable `compression` for large document collections
- Use `cleanup_interval` to manage storage

### Search Performance
- Enable `cache_embeddings` for frequently accessed documents
- Use `batch_inference` for multiple queries
- Configure `max_workers` for parallel processing

### Storage Optimization
- Regular cleanup of unused collections
- Monitor ChromaDB storage size
- Archive old project documents

## Integration Benefits

1. **Improved Decision Making**: AI responses are grounded in actual project documentation
2. **Consistency**: Ensures adherence to established standards and practices
3. **Knowledge Retention**: Captures and reuses organizational knowledge
4. **Reduced Errors**: Contextual information reduces misunderstandings
5. **Faster Onboarding**: New team members can access relevant documentation instantly

## Future Enhancements

- **Multi-modal Support**: Images, diagrams, and charts
- **Version Control Integration**: Git repository document sync
- **Collaborative Features**: Team document sharing and annotations
- **Advanced Analytics**: Document usage and relevance metrics
- **API Integration**: External knowledge base connections

## Support

For issues or questions regarding the RAG integration:
1. Check the logs for detailed error messages
2. Verify configuration settings
3. Test with smaller document sets first
4. Review the troubleshooting section above

---

**Note**: This integration maintains full backward compatibility with existing SDLC functionality while adding powerful RAG capabilities.
