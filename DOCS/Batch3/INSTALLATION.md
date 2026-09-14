
# Installation Guide - Enhanced RAG & ChromaDB Integration System

This guide provides detailed installation instructions for the Enhanced RAG system with all dependencies and optional components.

## 📋 Prerequisites

- Python 3.8 or higher
- pip package manager
- At least 4GB of available RAM
- 2GB of free disk space (for models and data)

## 🔧 Installation Methods

### Method 1: Standard Installation (Recommended)

1. **Clone or Download the Project**
   ```bash
   # If using git
   git clone <repository-url>
   cd Batch3
   
   # Or extract from archive
   unzip Batch3.zip
   cd Batch3
   ```

2. **Create Virtual Environment (Recommended)**
   ```bash
   python -m venv rag_env
   
   # Activate virtual environment
   # On Windows:
   rag_env\Scripts\activate
   
   # On macOS/Linux:
   source rag_env/bin/activate
   ```

3. **Install Core Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download Required Models**
   ```bash
   # Download spaCy English model
   python -m spacy download en_core_web_sm
   
   # NLTK data will be downloaded automatically on first use
   ```

### Method 2: Development Installation

For development or if you want to modify the system:

1. **Install in Development Mode**
   ```bash
   pip install -e .
   ```

2. **Install Additional Development Dependencies**
   ```bash
   pip install pytest black flake8 mypy jupyter
   ```

### Method 3: Docker Installation (Optional)

Create a Dockerfile for containerized deployment:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download models
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p /app/data /app/chroma_db /app/memory_store

EXPOSE 8000

CMD ["python", "examples/basic_usage.py"]
```

## 📦 Dependency Details

### Core Dependencies

```bash
# Vector database and embeddings
chromadb>=0.4.15
sentence-transformers>=2.2.2
transformers>=4.35.0

# Document processing
python-docx>=0.8.11
PyPDF2>=3.0.1
pdfplumber>=0.9.0
openpyxl>=3.1.2

# Text processing and NLP
nltk>=3.8.1
spacy>=3.7.0
langchain>=0.0.350

# Search and retrieval
rank-bm25>=0.2.2
faiss-cpu>=1.7.4

# Data processing
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0

# Utilities
tqdm>=4.66.0
python-dotenv>=1.0.0
pydantic>=2.5.0
```

### Optional Dependencies

For enhanced performance and additional features:

```bash
# GPU acceleration (if CUDA available)
pip install faiss-gpu torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Additional document formats
pip install python-pptx  # PowerPoint support
pip install python-docx2txt  # Enhanced DOCX processing
pip install tabula-py  # PDF table extraction

# Web scraping capabilities
pip install requests beautifulsoup4 selenium

# API development
pip install fastapi uvicorn  # For REST API
pip install streamlit  # For web interface
```

## 🔍 Verification

### Test Installation

1. **Run Basic Test**
   ```bash
   python -c "
   from utils.rag_utils import EnhancedRAGSystem
   from integrations.chromadb_enhanced import EnhancedChromaDBClient
   print('✅ Installation successful!')
   "
   ```

2. **Run Example Scripts**
   ```bash
   # Test basic functionality
   python examples/basic_usage.py
   
   # Test advanced features
   python examples/advanced_usage.py
   ```

3. **Check Model Downloads**
   ```bash
   python -c "
   import spacy
   import nltk
   from sentence_transformers import SentenceTransformer
   
   # Test spaCy
   nlp = spacy.load('en_core_web_sm')
   print('✅ spaCy model loaded')
   
   # Test sentence transformers
   model = SentenceTransformer('all-MiniLM-L6-v2')
   print('✅ Sentence transformer model loaded')
   
   print('✅ All models working correctly!')
   "
   ```

## 🐛 Troubleshooting

### Common Installation Issues

1. **ChromaDB Installation Fails**
   ```bash
   # Try upgrading pip first
   pip install --upgrade pip setuptools wheel
   
   # Install with specific version
   pip install chromadb==0.4.15
   
   # On macOS with M1/M2 chips
   pip install chromadb --no-deps
   pip install hnswlib pydantic>=1.9 posthog>=2.4.0
   ```

2. **spaCy Model Download Fails**
   ```bash
   # Alternative download method
   python -m spacy download en_core_web_sm --user
   
   # Or download manually
   pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
   ```

3. **FAISS Installation Issues**
   ```bash
   # For CPU-only systems
   pip install faiss-cpu --no-cache
   
   # For systems with CUDA
   pip install faiss-gpu --no-cache
   
   # Alternative: use conda
   conda install -c conda-forge faiss-cpu
   ```

4. **PDF Processing Issues**
   ```bash
   # Install additional dependencies for PDF processing
   pip install pdfminer.six PyMuPDF
   
   # On Ubuntu/Debian
   sudo apt-get install poppler-utils
   
   # On macOS
   brew install poppler
   ```

5. **Memory Issues During Installation**
   ```bash
   # Install with no cache to reduce memory usage
   pip install --no-cache-dir -r requirements.txt
   
   # Install packages one by one
   pip install chromadb
   pip install sentence-transformers
   # ... continue with other packages
   ```

### Platform-Specific Issues

#### Windows

```bash
# Install Microsoft C++ Build Tools if needed
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

# For PDF processing on Windows
pip install python-poppler
```

#### macOS

```bash
# Install Xcode command line tools
xcode-select --install

# Install Homebrew dependencies
brew install poppler tesseract

# For M1/M2 Macs, use conda for some packages
conda install -c conda-forge faiss-cpu
```

#### Linux (Ubuntu/Debian)

```bash
# Install system dependencies
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    python3-dev \
    poppler-utils \
    tesseract-ocr \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libglib2.0-0
```

## ⚙️ Configuration

### Environment Setup

1. **Create Environment File**
   ```bash
   # Create .env file in project root
   cat > .env << EOF
   # Chunking configuration
   CHUNK_SIZE=1000
   CHUNK_OVERLAP=200
   
   # Embedding configuration
   EMBEDDING_MODEL=all-MiniLM-L6-v2
   
   # ChromaDB configuration
   CHROMA_PERSIST_DIR=./chroma_db
   
   # Retrieval configuration
   TOP_K=10
   SIMILARITY_THRESHOLD=0.5
   
   # Logging
   LOG_LEVEL=INFO
   EOF
   ```

2. **Set System Environment Variables**
   ```bash
   # On Windows (Command Prompt)
   set CHROMA_PERSIST_DIR=C:\path\to\chroma_db
   
   # On Windows (PowerShell)
   $env:CHROMA_PERSIST_DIR="C:\path\to\chroma_db"
   
   # On macOS/Linux
   export CHROMA_PERSIST_DIR="/path/to/chroma_db"
   ```

### Directory Structure Setup

```bash
# Create necessary directories
mkdir -p data/documents
mkdir -p data/chroma_db
mkdir -p data/memory_store
mkdir -p logs
mkdir -p backups
```

## 🚀 Performance Optimization

### GPU Setup (Optional)

1. **Install CUDA Toolkit**
   - Download from NVIDIA website
   - Follow platform-specific installation guide

2. **Install GPU-Accelerated Packages**
   ```bash
   # Uninstall CPU versions first
   pip uninstall faiss-cpu torch
   
   # Install GPU versions
   pip install faiss-gpu
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
   ```

3. **Verify GPU Setup**
   ```bash
   python -c "
   import torch
   import faiss
   print(f'CUDA available: {torch.cuda.is_available()}')
   print(f'FAISS GPU support: {faiss.get_num_gpus() > 0}')
   "
   ```

### Memory Optimization

1. **Adjust Python Memory Settings**
   ```bash
   # Increase memory limit for large documents
   export PYTHONHASHSEED=0
   export OMP_NUM_THREADS=4
   ```

2. **Configure System Settings**
   ```bash
   # On Linux, increase file descriptor limits
   ulimit -n 65536
   
   # Increase virtual memory
   sudo sysctl vm.max_map_count=262144
   ```

## 📊 Monitoring Setup

### Logging Configuration

```python
# Create logging configuration file
import logging.config

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'INFO',
            'formatter': 'standard',
            'class': 'logging.StreamHandler',
        },
        'file': {
            'level': 'DEBUG',
            'formatter': 'standard',
            'class': 'logging.FileHandler',
            'filename': 'logs/rag_system.log',
            'mode': 'a',
        },
    },
    'loggers': {
        '': {
            'handlers': ['default', 'file'],
            'level': 'DEBUG',
            'propagate': False
        }
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
```

## 🔄 Updates and Maintenance

### Updating Dependencies

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Update specific packages
pip install --upgrade chromadb sentence-transformers

# Check for outdated packages
pip list --outdated
```

### Model Updates

```bash
# Update spaCy models
python -m spacy download en_core_web_sm --upgrade

# Clear sentence transformer cache to download latest models
rm -rf ~/.cache/torch/sentence_transformers/
```

## ✅ Post-Installation Checklist

- [ ] All dependencies installed successfully
- [ ] spaCy model downloaded and working
- [ ] ChromaDB can create and query collections
- [ ] Document processing works for all supported formats
- [ ] Memory management functions correctly
- [ ] Example scripts run without errors
- [ ] Environment variables configured
- [ ] Logging is working
- [ ] Data directories created with proper permissions

## 📞 Support

If you encounter issues during installation:

1. Check the troubleshooting section above
2. Verify your Python version and system requirements
3. Try installing in a fresh virtual environment
4. Check the GitHub issues for similar problems
5. Create a detailed issue report with:
   - Operating system and version
   - Python version
   - Complete error messages
   - Installation steps attempted

## 🎯 Next Steps

After successful installation:

1. Run the basic usage examples
2. Try processing your own documents
3. Experiment with different configuration options
4. Explore the advanced features
5. Consider setting up monitoring and logging for production use

The system is now ready for use! Proceed to the main README.md for usage instructions and examples.
