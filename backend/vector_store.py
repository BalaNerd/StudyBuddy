"""
Vector Store Module

This module implements a FAISS-based vector database for semantic search.
Uses IndexFlatIP for cosine similarity with normalized embeddings.

Why IndexFlatIP?
- Direct inner product similarity (equivalent to cosine for normalized vectors)
- More intuitive similarity scores (higher = more similar)
- Better performance for normalized embeddings
- Industry standard for production RAG systems

"""

import faiss
import numpy as np
import pickle
from pathlib import Path
from typing import List, Tuple, Optional


class VectorStore:
    """
    FAISS-based vector store for semantic search using cosine similarity.
    
    Attributes:
        index: FAISS index instance (IndexFlatIP for cosine similarity)
        texts: List of text chunks corresponding to vectors
        dimension: Dimension of stored vectors
    """
    
    def __init__(self, dimension: int):
        """
        Initialize the vector store.
        
        Args:
            dimension: Dimension of vectors to store (e.g., 768 for all-mpnet-base-v2)
        """
        self.dimension = dimension
        # Use IndexFlatIP for cosine similarity with normalized embeddings
        self.index = faiss.IndexFlatIP(dimension)
        self.texts: List[str] = []
    
    def add_vectors(self, vectors: np.ndarray, texts: List[str]) -> None:
        """
        Add vectors and corresponding texts to the store.
        
        Args:
            vectors: Numpy array of shape (n_vectors, dimension) - should be normalized
            texts: List of text strings corresponding to vectors
            
        Raises:
            ValueError: If dimensions don't match or lengths don't match
        """
        if vectors.shape[1] != self.dimension:
            raise ValueError(
                f"Vector dimension {vectors.shape[1]} doesn't match store dimension {self.dimension}"
            )
        
        if len(vectors) != len(texts):
            raise ValueError(
                f"Number of vectors {len(vectors)} doesn't match number of texts {len(texts)}"
            )
        
        # Ensure vectors are float32 (FAISS requirement)
        vectors = vectors.astype('float32')
        
        # Verify vectors are normalized (critical for IndexFlatIP)
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        if not np.allclose(norms, 1.0, atol=1e-6):
            print("Warning: Vectors are not normalized. Normalizing now...")
            vectors = vectors / (norms + 1e-8)
        
        # Add to FAISS index
        self.index.add(vectors)
        
        # Store corresponding texts
        self.texts.extend(texts)
    
    def search(self, query_vector: np.ndarray, k: int = 5) -> List[Tuple[str, float]]:
        """
        Search for most similar vectors using cosine similarity.
        
        Args:
            query_vector: Query vector of shape (dimension,) or (1, dimension) - should be normalized
            k: Number of results to return
            
        Returns:
            List of tuples (text, similarity_score) sorted by similarity (higher = more similar)
            
        Raises:
            ValueError: If query dimension doesn't match store dimension
        """
        if query_vector.ndim == 1:
            query_vector = query_vector.reshape(1, -1)
        
        if query_vector.shape[1] != self.dimension:
            raise ValueError(
                f"Query dimension {query_vector.shape[1]} doesn't match store dimension {self.dimension}"
            )
        
        # Ensure float32 and normalized
        query_vector = query_vector.astype('float32')
        
        # Normalize query vector
        norm = np.linalg.norm(query_vector)
        if norm > 0:
            query_vector = query_vector / norm
        
        # Search in FAISS
        k = min(k, self.index.ntotal)  # Don't request more than available
        similarities, indices = self.index.search(query_vector, k)
        
        # Convert to list of (text, similarity) tuples
        results = []
        for similarity, idx in zip(similarities[0], indices[0]):
            if idx < len(self.texts):
                # IndexFlatIP returns inner product (cosine similarity for normalized vectors)
                # Range: [-1, 1], where 1 = identical, 0 = orthogonal, -1 = opposite
                similarity_score = float(similarity)
                results.append((self.texts[idx], similarity_score))
        
        return results
    
    def save(self, index_path: str, texts_path: str) -> None:
        """
        Save the FAISS index and texts to disk.
        
        Args:
            index_path: Path to save FAISS index
            texts_path: Path to save texts (as pickle)
        """
        # Save FAISS index
        faiss.write_index(self.index, index_path)
        
        # Save texts
        with open(texts_path, 'wb') as f:
            pickle.dump(self.texts, f)
    
    def load(self, index_path: str, texts_path: str) -> None:
        """
        Load the FAISS index and texts from disk.
        
        Args:
            index_path: Path to FAISS index file
            texts_path: Path to texts pickle file
            
        Raises:
            FileNotFoundError: If files don't exist
        """
        if not Path(index_path).exists():
            raise FileNotFoundError(f"Index file not found: {index_path}")
        if not Path(texts_path).exists():
            raise FileNotFoundError(f"Texts file not found: {texts_path}")
        
        # Load FAISS index
        self.index = faiss.read_index(index_path)
        self.dimension = self.index.d
        
        # Load texts
        with open(texts_path, 'rb') as f:
            self.texts = pickle.load(f)
    
    def get_size(self) -> int:
        """
        Get the number of vectors stored.
        
        Returns:
            Number of stored vectors
        """
        return self.index.ntotal
