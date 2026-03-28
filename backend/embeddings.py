"""
Embeddings Module

This module handles text embeddings using SentenceTransformers.
Uses 'sentence-transformers/all-mpnet-base-v2' model for better semantic representations.

Why all-mpnet-base-v2?
- Better semantic understanding than MiniLM
- Higher dimensional embeddings (768 vs 384)
- Improved performance on question-answering tasks
- Better at capturing nuanced relationships

"""

import numpy as np
from typing import List, Union
from sentence_transformers import SentenceTransformer


class EmbeddingGenerator:
    """
    Generates embeddings for text chunks using SentenceTransformers.
    
    Attributes:
        model: SentenceTransformer model instance
        model_name: Name of the model being used
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-mpnet-base-v2"):
        """
        Initialize the embedding generator.
        
        Args:
            model_name: Name of the SentenceTransformer model (default: all-mpnet-base-v2)
        """
        print(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        self.model_name = model_name
        print("Embedding model loaded successfully")
    
    def generate_embeddings(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Generate embeddings for input text(s).
        
        Args:
            texts: Single text string or list of text strings
            
        Returns:
            Numpy array of embeddings (normalized for cosine similarity)
            Shape: (n_texts, embedding_dim) for list, (embedding_dim,) for single text
        """
        if isinstance(texts, str):
            texts = [texts]
        
        if not texts:
            raise ValueError("Empty text list provided")
        
        # Generate embeddings with L2 normalization
        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,  # Critical for cosine similarity
            show_progress_bar=len(texts) > 10,
            batch_size=32,  # Optimize batch size
            device='cpu'  # Ensure CPU usage for consistency
        )
        
        # Verify embeddings are properly normalized
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        if not np.allclose(norms, 1.0, atol=1e-6):
            # Re-normalize if needed
            embeddings = embeddings / (norms + 1e-8)
            print("Warning: Re-normalized embeddings")
        
        return embeddings
    
    def get_embedding_dimension(self) -> int:
        """
        Get the dimension of embeddings produced by this model.
        
        Returns:
            Embedding dimension
        """
        # all-mpnet-base-v2 produces 768-dimensional embeddings
        test_embedding = self.generate_embeddings("test")
        return test_embedding.shape[-1]
