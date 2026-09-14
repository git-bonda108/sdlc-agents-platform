
# Enhanced RAG & ChromaDB Integration System - Batch 3

A comprehensive Retrieval-Augmented Generation (RAG) system with advanced ChromaDB integration, intelligent document processing, semantic search capabilities, and persistent memory management.

## 🚀 Features

### Core Components

1. **Enhanced ChromaDB Integration**
   - Multi-collection management for different document types
   - Persistent storage with advanced metadata management
   - Collection optimization and maintenance tools
   - Backup and restore capabilities
   - Hybrid search combining dense and sparse retrieval

2. **Advanced Document Processing**
   - Support for multiple file formats (PDF, DOCX, Excel, CSV, TXT, Markdown)
   - Intelligent chunking strategies (semantic, sliding window, hierarchical)
   - Document preprocessing with cleaning and normalization
   - Metadata extraction and enrichment
   - Batch processing capabilities

3. **Semantic Search Enhancement**
   - Hybrid retrieval combining dense (embeddings) and sparse (BM25) methods
   - Context-aware ranking and filtering
   - Query expansion and refinement
   - Similarity threshold optimization
   - Multi-query processing

4. **Memory Management**
   - Conversation memory persistence across sessions
   - Context window management with automatic trimming
   - Memory consolidation and summarization
   - Importance-based memory retention
   - Tag-based memory organization
   - Export/import capabilities

5. **Configuration Management**
   - Flexible configuration system with environment variable support
   - Customizable chunking, embedding, and retrieval parameters
   - Performance tuning options
   - Logging and metrics configuration

## 📁 Project Structure

```
Batch3/
├── config/
│   ├── __init__.py
│   └── rag_config.py          # Configuration management
├── integrations/
│   ├── __init__.py
│   ├── chromadb_enhanced.py   # Enhanced ChromaDB client
│   └── memory_manager.py      # Advanced memory management
├── utils/
│   ├── __init__.py
│   ├── document_processor.py  # Document processing and chunking
│   └── rag_utils.py          # Main RAG system utilities
├── examples/
│   ├── basic_usage.py        # Basic usage examples
│   └── advanced_usage.py     # Advanced usage examples
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## 🛠 Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download Required Models**
   ```bash
   # Download spaCy model for advanced text processing
   python -m spacy download en_core_web_sm
   
   # NLTK data will be downloaded automatically on first use
   ```

3. **Optional: GPU Support**
   ```bash
   # For GPU acceleration (optional)
   pip install faiss-gpu torch-audio
   ```

## 🚀 Quick Start

### Basic Usage

```python
from utils.rag_utils import EnhancedRAGSystem

# Initialize the RAG system
rag_system = EnhancedRAGSystem(persist_directory="./my_rag_data")

# Ingest documents
result = rag_system.ingest_documents(
    file_paths=["document1.pdf", "document2.docx"],
    collection_name="my_documents"
)

# Query the system
response = rag_system.query(
    query_text="What is machine learning?",
    collection_name="my_documents",
    session_id="user_session_1"
)

# Display results
for result in response['results']:
    print(f"Score: {result['boosted_score']:.3f}")
    print(f"Content: {result['content'][:200]}...")
    print("---")

# Close the system
rag_system.close()
```

### Custom Configuration

```python
from config.rag_config import RAGConfig, ChunkingConfig, EmbeddingConfig
from utils.rag_utils import EnhancedRAGSystem

# Create custom configuration
config = RAGConfig(
    chunking=ChunkingConfig(
        chunk_size=800,
        chunk_overlap=150,
        semantic_threshold=0.8
    ),
    embedding=EmbeddingConfig(
        model_name="all-mpnet-base-v2",
        normalize_embeddings=True
    )
)

# Initialize with custom config
rag_system = EnhancedRAGSystem(config=config)
```

## 📚 Advanced Features

### Multi-Collection Management

```python
from integrations.chromadb_enhanced import EnhancedChromaDBClient

client = EnhancedChromaDBClient()

# Create specialized collections
client.create_collection("technical_docs", metadata={"type": "technical"})
client.create_collection("research_papers", metadata={"type": "research"})
client.create_collection("business_docs", metadata={"type": "business"})

# Query specific collections
results = client.query_collection(
    collection_name="technical_docs",
    query_texts=["API documentation"],
    n_results=5
)
```

### Advanced Memory Management

```python
from integrations.memory_manager import EnhancedMemoryManager
from datetime import timedelta

memory = EnhancedMemoryManager()

# Store memory with expiration
memory.set(
    "user_session",
    {"preferences": {"theme": "dark"}},
    importance_score=2.0,
    tags=["user", "session"],
    expires_in=timedelta(hours=24)
)

# Search by tags
user_memories = memory.search_by_tags(["user"], match_all=True)

# Search by content
relevant_memories = memory.search_by_content("machine learning", limit=5)
```

### Hybrid Retrieval

```python
from utils.rag_utils import HybridRetriever
from utils.document_processor import DocumentProcessor

# Process documents
processor = DocumentProcessor()
chunks = processor.process_file("document.pdf")

# Initialize hybrid retriever
retriever = HybridRetriever()
retriever.index_documents(chunks)

# Perform hybrid search
results = retriever.retrieve(
    query="machine learning algorithms",
    top_k=10,
    alpha=0.7  # Balance between dense (0.7) and sparse (0.3) retrieval
)
```

## ⚙️ Configuration Options

### Environment Variables

```bash
# Chunking configuration
export CHUNK_SIZE=1000
export CHUNK_OVERLAP=200

# Embedding configuration
export EMBEDDING_MODEL="all-MiniLM-L6-v2"

# ChromaDB configuration
export CHROMA_PERSIST_DIR="./chroma_db"

# Retrieval configuration
export TOP_K=10
export SIMILARITY_THRESHOLD=0.5
```

### Configuration File

```python
from config.rag_config import RAGConfig

# Load configuration from environment
config = load_config_from_env()

# Or create custom configuration
config = RAGConfig(
    chunking=ChunkingConfig(chunk_size=1200),
    retrieval=RetrievalConfig(top_k=15, hybrid_alpha=0.8)
)
```

## 📊 Performance Monitoring

### System Statistics

```python
# Get comprehensive system stats
stats = rag_system.get_system_stats()

print(f"Collections: {stats['chromadb']['total_collections']}")
print(f"Memory entries: {stats['memory']['total_entries']}")
print(f"Indexed collections: {stats['indexed_collections']}")
```

### Memory Analytics

```python
# Get detailed memory statistics
memory_stats = memory_manager.get_memory_stats()

print(f"Active entries: {memory_stats['active_entries']}")
print(f"Tag distribution: {memory_stats['tag_distribution']}")
print(f"Average importance: {memory_stats['access_stats']['avg_importance']}")
```

## 🔧 Maintenance and Optimization

### System Optimization

```python
# Optimize the entire system
optimization_result = rag_system.optimize_system()
print(f"Optimization completed: {optimization_result}")
```

### Memory Consolidation

```python
# Consolidate memory (remove expired, low-importance entries)
consolidation_result = memory_manager.consolidate_memory()
print(f"Consolidation result: {consolidation_result}")
```

### Data Backup

```python
# Export system data for backup
export_result = rag_system.export_system_data("./backup_folder")
print(f"Backup completed: {export_result}")

# Export memory separately
memory_export = memory_manager.export_memory("./memory_backup.json")
```

## 🎯 Use Cases

1. **Document Q&A Systems**
   - Ingest technical documentation, manuals, and guides
   - Provide accurate answers with source attribution
   - Maintain conversation context across sessions

2. **Research Assistant**
   - Process academic papers and research documents
   - Semantic search across large document collections
   - Context-aware result ranking

3. **Knowledge Management**
   - Organize and search company knowledge bases
   - Multi-collection management for different departments
   - Persistent memory for user preferences and history

4. **Content Analysis**
   - Process and analyze large document collections
   - Extract insights and patterns from text data
   - Advanced chunking for optimal information retrieval

## 🔍 Supported File Formats

- **PDF**: Text extraction with pdfplumber and PyPDF2 fallback
- **DOCX**: Full document processing including tables
- **Excel (XLSX/XLS)**: Multi-sheet processing with data extraction
- **CSV**: Structured data processing
- **Text (TXT/MD)**: Plain text and Markdown files
- **Extensible**: Easy to add support for additional formats

## 🧠 Chunking Strategies

1. **Semantic Chunking**: Groups sentences based on semantic similarity
2. **Sliding Window**: Fixed-size chunks with configurable overlap
3. **Hierarchical**: Maintains document structure and hierarchy
4. **Adaptive**: Automatically selects best strategy based on content

## 🔄 Integration with Existing Systems

### Extending the System

```python
# Custom document processor
class CustomDocumentProcessor(DocumentProcessor):
    def _extract_custom_format(self, file_path):
        # Implement custom format processing
        pass

# Custom memory backend
class CustomMemoryManager(EnhancedMemoryManager):
    def _save_memory(self):
        # Implement custom persistence
        pass
```

### API Integration

The system is designed to be easily integrated into web applications, APIs, and other systems:

```python
# Example Flask integration
from flask import Flask, request, jsonify

app = Flask(__name__)
rag_system = EnhancedRAGSystem()

@app.route('/query', methods=['POST'])
def query_endpoint():
    data = request.json
    result = rag_system.query(
        query_text=data['query'],
        collection_name=data.get('collection', 'default'),
        session_id=data.get('session_id', 'default')
    )
    return jsonify(result)
```

## 🚨 Error Handling and Logging

The system includes comprehensive error handling and logging:

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# The system will log important events, errors, and performance metrics
```

## 📈 Performance Tips

1. **Batch Processing**: Process multiple documents together for better efficiency
2. **Embedding Caching**: Pre-compute embeddings for frequently accessed documents
3. **Memory Management**: Regular consolidation to maintain optimal performance
4. **Collection Organization**: Use separate collections for different document types
5. **Configuration Tuning**: Adjust chunk sizes and retrieval parameters based on your use case

## 🤝 Contributing

To extend or modify the system:

1. Follow the existing code structure and patterns
2. Add comprehensive error handling and logging
3. Include unit tests for new functionality
4. Update documentation and examples
5. Consider backward compatibility

## 📄 License

This enhanced RAG system is designed for educational and development purposes. Please ensure compliance with the licenses of all dependencies and models used.

## 🆘 Troubleshooting

### Common Issues

1. **Memory Issues**: Reduce batch sizes or chunk sizes if running out of memory
2. **Model Loading**: Ensure sufficient disk space for embedding models
3. **File Processing**: Check file permissions and formats
4. **ChromaDB Errors**: Verify persist directory permissions

### Performance Optimization

1. **GPU Acceleration**: Install CUDA-compatible versions of PyTorch and FAISS
2. **Memory Usage**: Monitor and adjust memory limits in configuration
3. **Disk Space**: Ensure adequate space for ChromaDB persistence and model storage

For more detailed examples and advanced usage patterns, see the `examples/` directory.
