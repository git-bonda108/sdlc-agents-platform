
# Upgrade Instructions: SDLC to RAG-Enhanced System

## Overview
This document provides step-by-step instructions for upgrading your existing SDLC Agentic AI system to include RAG (Retrieval-Augmented Generation) capabilities.

## Prerequisites

### 1. Backup Current System
```bash
# Create backup of current system
cp -r /path/to/current/sdlc /path/to/backup/sdlc_backup_$(date +%Y%m%d)
```

### 2. Verify Python Environment
```bash
python --version  # Should be 3.8+
pip --version
```

### 3. Check Available Disk Space
```bash
df -h  # Ensure at least 2GB free space for ChromaDB
```

## Installation Steps

### Step 1: Install RAG Dependencies
```bash
# Install new dependencies
pip install chromadb>=0.4.0
pip install sentence-transformers>=2.2.0
pip install tiktoken>=0.5.0
pip install PyPDF2>=3.0.0
pip install pdfplumber>=0.9.0
pip install nltk>=3.8.0

# Optional: Install spaCy model for advanced text processing
python -m spacy download en_core_web_sm
```

### Step 2: Copy Batch 3 RAG Components
```bash
# Copy RAG components from Batch 3
cp -r ~/Batches/Batch3/* /path/to/your/project/rag_components/

# Or create symbolic links
ln -s ~/Batches/Batch3 /path/to/your/project/rag_components
```

### Step 3: Replace Core Files
```bash
# Backup original files
mv ui.py ui.py.backup
mv main_sdlc_agentic_ai.py main_sdlc_agentic_ai.py.backup
mv manager.py manager.py.backup
mv config.py config.py.backup
mv requirements.txt requirements.txt.backup

# Copy enhanced files from Batch 3B
cp ~/Batches/Batch3B/ui.py .
cp ~/Batches/Batch3B/main_sdlc_agentic_ai.py .
cp ~/Batches/Batch3B/manager.py .
cp ~/Batches/Batch3B/config.py .
cp ~/Batches/Batch3B/requirements.txt .
cp ~/Batches/Batch3B/manager_config.yaml .
```

### Step 4: Update Configuration

#### 4.1 Environment Variables
Add to your `.env` file:
```bash
# RAG Configuration
RAG_ENABLED=true
CHROMA_PERSIST_DIR=./chroma_db
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
RAG_TOP_K=10
SIMILARITY_THRESHOLD=0.5
```

#### 4.2 Update manager_config.yaml
The new `manager_config.yaml` includes RAG configuration. Merge your existing settings:

```yaml
# Your existing configuration
abacus:
  api_key: ${ABACUS_API_KEY}
  # ... your existing settings

# New RAG section (automatically included)
rag:
  enabled: true
  chromadb:
    persist_directory: "./chroma_db"
  # ... other RAG settings
```

### Step 5: Initialize ChromaDB
```bash
# Create ChromaDB directory
mkdir -p ./chroma_db

# Set permissions
chmod 755 ./chroma_db
```

### Step 6: Test Installation
```bash
# Run integration tests
python -m pytest ~/Batches/Batch3B/tests/test_integration.py -v

# Start the application
streamlit run main_sdlc_agentic_ai.py
```

## Verification Steps

### 1. Check RAG Status
- Open the application in your browser
- Look for "RAG Enhanced" message in the main interface
- Check sidebar for "RAG Document Management" section
- Verify ChromaDB status shows "🟢 Connected"

### 2. Test Document Upload
- Upload a test document (PDF, DOCX, or TXT)
- Click "Process Documents"
- Verify document count increases
- Test search functionality

### 3. Test RAG-Enhanced Responses
- Select any SDLC phase
- Enter a prompt related to your uploaded documents
- Run the phase and verify "Retrieved Context" section appears
- Check that responses reference your documents

## Troubleshooting

### Common Issues

#### 1. ChromaDB Connection Failed
```bash
# Check directory permissions
ls -la ./chroma_db

# Recreate directory
rm -rf ./chroma_db
mkdir -p ./chroma_db
```

#### 2. Import Errors
```bash
# Verify Batch3 path
ls ~/Batches/Batch3/

# Check Python path
python -c "import sys; print(sys.path)"

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### 3. Memory Issues
```bash
# Check available memory
free -h

# Reduce batch size in config
# Edit manager_config.yaml:
# rag:
#   embedding:
#     batch_size: 16  # Reduce from 32
```

#### 4. Document Processing Errors
```bash
# Check file permissions
ls -la /tmp/

# Verify file formats
file your_document.pdf

# Check file size
du -h your_document.pdf  # Should be < 50MB
```

### Performance Optimization

#### 1. For Large Document Collections
```yaml
# In manager_config.yaml
rag:
  performance:
    cache_size: 2000
    batch_inference: true
    async_processing: true
```

#### 2. For Limited Memory Systems
```yaml
rag:
  chunking:
    chunk_size: 500  # Reduce from 1000
  embedding:
    batch_size: 16   # Reduce from 32
```

#### 3. For Faster Search
```yaml
rag:
  retrieval:
    top_k: 5         # Reduce from 10
    enable_query_expansion: false
```

## Migration Checklist

- [ ] Backup current system
- [ ] Install dependencies
- [ ] Copy RAG components
- [ ] Replace core files
- [ ] Update configuration
- [ ] Initialize ChromaDB
- [ ] Run tests
- [ ] Verify RAG functionality
- [ ] Upload test documents
- [ ] Test enhanced responses
- [ ] Monitor performance
- [ ] Document any customizations

## Rollback Procedure

If you need to rollback to the original system:

```bash
# Stop the application
# Restore original files
mv ui.py.backup ui.py
mv main_sdlc_agentic_ai.py.backup main_sdlc_agentic_ai.py
mv manager.py.backup manager.py
mv config.py.backup config.py
mv requirements.txt.backup requirements.txt

# Remove RAG dependencies (optional)
pip uninstall chromadb sentence-transformers tiktoken PyPDF2 pdfplumber nltk

# Remove ChromaDB directory
rm -rf ./chroma_db

# Restart application
streamlit run main_sdlc_agentic_ai.py
```

## Support and Maintenance

### Regular Maintenance
- Monitor ChromaDB storage size: `du -sh ./chroma_db`
- Clean up old documents periodically
- Update embedding models as needed
- Review and optimize configuration based on usage

### Monitoring
- Check application logs for RAG-related errors
- Monitor memory usage during document processing
- Track search performance and relevance

### Updates
- Keep RAG dependencies updated
- Monitor for new embedding models
- Review ChromaDB updates and migrations

## Advanced Configuration

### Custom Embedding Models
```yaml
rag:
  embedding:
    model_name: "sentence-transformers/all-mpnet-base-v2"  # Higher quality
    dimension: 768  # Update accordingly
```

### Multiple Collections
```yaml
rag:
  chromadb:
    collection_prefix: "project_specific_"
    max_collections: 20
```

### Enhanced Security
```yaml
rag:
  security:
    enable_auth: true
    data_encryption: true
```

---

For additional support, refer to:
- Batch 3 documentation: `~/Batches/Batch3/README.md`
- Integration guide: `~/Batches/Batch3B/README_INTEGRATION.md`
- Test results: Run integration tests for detailed diagnostics
