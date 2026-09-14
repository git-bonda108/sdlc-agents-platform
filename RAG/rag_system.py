
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import os
import json

class RAGSystem:
    """Retrieval Augmented Generation system using ChromaDB"""
    
    def __init__(self, db_path: str = "./chroma_db", collection_name: str = "sdlc_documents"):
        self.db_path = db_path
        self.collection_name = collection_name
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Initialize embedding model
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get or create collection
        try:
            self.collection = self.client.get_collection(name=collection_name)
        except:
            self.collection = self.client.create_collection(
                name=collection_name,
                metadata={"description": "SDLC documents and knowledge base"}
            )
    
    def add_document(self, document_id: str, content: str, metadata: Optional[Dict] = None) -> None:
        """Add a document to the knowledge base"""
        if metadata is None:
            metadata = {}
        
        # Generate embedding
        embedding = self.embedding_model.encode(content).tolist()
        
        # Add to collection
        self.collection.add(
            documents=[content],
            embeddings=[embedding],
            metadatas=[metadata],
            ids=[document_id]
        )
    
    def add_documents_batch(self, documents: List[Dict[str, Any]]) -> None:
        """Add multiple documents in batch"""
        contents = [doc["content"] for doc in documents]
        embeddings = self.embedding_model.encode(contents).tolist()
        
        self.collection.add(
            documents=contents,
            embeddings=embeddings,
            metadatas=[doc.get("metadata", {}) for doc in documents],
            ids=[doc["id"] for doc in documents]
        )
    
    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        query_embedding = self.embedding_model.encode(query).tolist()
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results["documents"][0])):
            formatted_results.append({
                "id": results["ids"][0][i],
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i]
            })
        
        return formatted_results
    
    def update_document(self, document_id: str, content: str, metadata: Optional[Dict] = None) -> None:
        """Update an existing document"""
        if metadata is None:
            metadata = {}
        
        embedding = self.embedding_model.encode(content).tolist()
        
        self.collection.update(
            ids=[document_id],
            documents=[content],
            embeddings=[embedding],
            metadatas=[metadata]
        )
    
    def delete_document(self, document_id: str) -> None:
        """Delete a document from the knowledge base"""
        self.collection.delete(ids=[document_id])
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection"""
        return {
            "name": self.collection_name,
            "count": self.collection.count(),
            "metadata": self.collection.metadata
        }

class DocumentProcessor:
    """Process various document types for RAG system"""
    
    @staticmethod
    def process_text_file(file_path: str) -> str:
        """Process a text file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    @staticmethod
    def process_markdown_file(file_path: str) -> str:
        """Process a markdown file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    @staticmethod
    def process_python_file(file_path: str) -> str:
        """Process a Python file and extract docstrings and comments"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract docstrings and comments
        # This is a simplified version - you might want to use ast module for better parsing
        lines = content.split('\n')
        processed_lines = []
        
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('#') or '"""' in stripped or "'''" in stripped:
                processed_lines.append(line)
            elif 'def ' in stripped or 'class ' in stripped:
                processed_lines.append(line)
        
        return '\n'.join(processed_lines)

# Example usage
if __name__ == "__main__":
    # Initialize RAG system
    rag = RAGSystem()
    
    # Add sample documents
    sample_docs = [
        {
            "id": "doc1",
            "content": "FastAPI is a modern web framework for building APIs with Python",
            "metadata": {"type": "documentation", "topic": "FastAPI"}
        },
        {
            "id": "doc2", 
            "content": "CrewAI enables the creation of AI agent crews for collaborative tasks",
            "metadata": {"type": "documentation", "topic": "CrewAI"}
        }
    ]
    
    rag.add_documents_batch(sample_docs)
    
    # Search for relevant documents
    results = rag.search("How to build APIs with Python?")
    print("Search results:", json.dumps(results, indent=2))
