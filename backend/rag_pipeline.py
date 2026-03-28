"""
RAG Pipeline Module

This module orchestrates the complete RAG (Retrieval-Augmented Generation) pipeline:
1. PDF processing
2. Text chunking
3. Embedding generation
4. Vector store indexing
5. Retrieval
6. Answer generation

This is the main orchestrator that ties all components together.
"""

from typing import List, Tuple, Optional
from pathlib import Path
import numpy as np
import re
import logging

from pdf_processor import PDFProcessor
from text_chunker import TextChunker
from embeddings import EmbeddingGenerator
from vector_store import VectorStore
from retriever import Retriever
from answer_generator import AnswerGenerator
from summarizer import Summarizer

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Complete RAG pipeline for question answering from PDFs.
    
    Attributes:
        pdf_processor: PDFProcessor instance
        chunker: TextChunker instance
        embedding_generator: EmbeddingGenerator instance
        vector_store: VectorStore instance
        retriever: Retriever instance
        answer_generator: AnswerGenerator instance
        summarizer: Summarizer instance
        is_indexed: Whether documents have been indexed
    """
    
    def __init__(
        self,
        embedding_model: str = "sentence-transformers/all-mpnet-base-v2",
        answer_model: str = "google/flan-t5-base",
        summarizer_model: str = "facebook/bart-large-cnn",
        chunk_size: int = 900,  # Improved chunk size
        chunk_overlap: int = 180  # Improved overlap
    ):
        """
        Initialize the RAG pipeline.
        
        Args:
            embedding_model: Model for embeddings (default: all-mpnet-base-v2)
            answer_model: Model for answer generation (default: google/flan-t5-base)
            summarizer_model: Model for summarization (default: facebook/bart-large-cnn)
            chunk_size: Chunk size in tokens (default: 900)
            chunk_overlap: Chunk overlap in tokens (default: 180)
        """
        print("Initializing RAG Pipeline...")
        
        # Initialize components
        self.pdf_processor = PDFProcessor()
        self.chunker = TextChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        self.embedding_generator = EmbeddingGenerator(model_name=embedding_model)
        self.answer_generator = AnswerGenerator(model_name=answer_model)
        self.summarizer = Summarizer(model_name=summarizer_model)
        
        # Initialize vector store with embedding dimension
        embedding_dim = self.embedding_generator.get_embedding_dimension()
        self.vector_store = VectorStore(dimension=embedding_dim)
        self.retriever = Retriever(self.embedding_generator, self.vector_store)
        
        self.is_indexed = False
        
        print("RAG Pipeline initialized successfully")
    
    def process_pdf(self, pdf_path: str) -> Tuple[List[str], str]:
        """
        Process a PDF file: extract text and chunk it.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Tuple of (chunks, full_text)
        """
        print(f"Processing PDF: {pdf_path}")
        
        # Extract text
        text = self.pdf_processor.extract_text(pdf_path)
        print(f"Extracted {len(text)} characters from PDF")
        
        # Clean text
        text = self._clean_text(text)
        print(f"Cleaned text length: {len(text)} characters")
        
        # Chunk text
        chunks = self.chunker.chunk_text(text)
        print(f"Created {len(chunks)} chunks")
        
        # Ensure minimum chunks
        if len(chunks) < 3:
            print("Warning: Very few chunks created. Consider larger document.")
        
        return chunks, text
    
    def index_documents(self, chunks: List[str]) -> None:
        """
        Index document chunks in the vector store.
        
        Args:
            chunks: List of text chunks to index
        """
        if not chunks:
            raise ValueError("No chunks provided for indexing")
        
        print(f"Indexing {len(chunks)} chunks...")
        
        # Generate embeddings
        embeddings = self.embedding_generator.generate_embeddings(chunks)
        print(f"Generated embeddings of shape {embeddings.shape}")
        
        # Add to vector store
        self.vector_store.add_vectors(embeddings, chunks)
        self.is_indexed = True
        
        print(f"Indexed {self.vector_store.get_size()} chunks successfully")
    
    def answer_question(self, question: str, k: int = 8, min_similarity: float = 0.2) -> Tuple[str, List[Tuple[str, float]]]:
        """
        Answer a question using the RAG pipeline.
        
        Args:
            question: User question
            k: Number of chunks to retrieve (default: 8)
            min_similarity: Minimum similarity threshold (default: 0.2)
            
        Returns:
            Tuple of (answer, retrieved_chunks_with_scores)
        """
        if not self.is_indexed:
            return (
                "No documents have been indexed. Please upload and process a PDF first.",
                []
            )
        
        # Clean question
        question = self._clean_text(question)
        
        # Retrieve relevant chunks (always return top_k chunks)
        retrieved_chunks = self.retriever.retrieve(question, k=k, min_similarity=min_similarity)
        
        # Debug logging
        logger.info(f"Retrieved {len(retrieved_chunks)} chunks for question: {question}")
        for i, (chunk, score) in enumerate(retrieved_chunks[:3]):
            logger.info(f"Chunk {i+1} (score: {score:.3f}): {chunk[:100]}...")
        
        # Always try to generate answer, even with low scores
        if not retrieved_chunks:
            logger.warning("No chunks retrieved, returning fallback response")
            return (
                "I couldn't find relevant information in the uploaded documents to answer this question. Please try rephrasing your question or upload more relevant documents.",
                []
            )
        
        # Generate answer
        answer = self.answer_generator.generate_answer(question, retrieved_chunks)
        
        # Post-process answer
        answer = self._post_process_answer(answer)
        
        return answer, retrieved_chunks
    
    def summarize_documents(self, text: str) -> str:
        """
        Summarize the uploaded documents.
        
        Args:
            text: Full text to summarize
            
        Returns:
            Summary string
        """
        # Clean text before summarization
        cleaned_text = self._clean_text(text)
        
        # Generate summary
        summary = self.summarizer.summarize(cleaned_text)
        
        # Post-process summary
        summary = self._post_process_summary(summary)
        
        return summary
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text by fixing spacing, removing extra whitespace, and normalizing.
        
        Args:
            text: Input text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Fix spacing around punctuation
        text = re.sub(r'\s+([,.!?;:])', r'\1', text)
        
        # Fix spacing after punctuation
        text = re.sub(r'([,.!?;:])\s*', r'\1 ', text)
        
        # Remove extra spaces at start/end
        text = text.strip()
        
        # Ensure proper sentence spacing
        text = re.sub(r'([a-z])([A-Z])', r'\1. \2', text)
        
        return text
    
    def _post_process_answer(self, answer: str) -> str:
        """
        Post-process answer for readability.
        
        Args:
            answer: Raw answer
            
        Returns:
            Processed answer
        """
        if not answer:
            return "I couldn't find a relevant answer."
        
        # Clean spacing
        answer = self._clean_text(answer)
        
        # Capitalize first letter
        if answer and not answer[0].isupper():
            answer = answer[0].upper() + answer[1:]
        
        # Ensure proper ending
        if answer and not answer.endswith(('.', '!', '?')):
            answer += '.'
        
        return answer
    
    def _post_process_summary(self, summary: str) -> str:
        """
        Post-process summary for readability.
        
        Args:
            summary: Raw summary
            
        Returns:
            Processed summary
        """
        if not summary:
            return "No summary could be generated."
        
        # Clean spacing
        summary = self._clean_text(summary)
        
        # Capitalize sentences
        sentences = re.split(r'([.!?])', summary)
        processed_sentences = []
        
        for i in range(0, len(sentences), 2):
            if i < len(sentences):
                sentence = sentences[i].strip()
                if sentence:
                    # Capitalize first letter
                    sentence = sentence[0].upper() + sentence[1:] if sentence else sentence
                    processed_sentences.append(sentence)
                    
                    # Add punctuation back
                    if i + 1 < len(sentences):
                        processed_sentences.append(sentences[i + 1])
        
        return ''.join(processed_sentences)
    
    def get_current_time(self) -> str:
        """Get current timestamp for logging."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def clear_index(self) -> None:
        """Clear the current index."""
        self.vector_store = VectorStore(dimension=self.embedding_generator.get_embedding_dimension())
        self.retriever = Retriever(self.embedding_generator, self.vector_store)
        self.is_indexed = False
        print("Index cleared successfully")
    
    def save_index(self, index_path: str, texts_path: str) -> None:
        """
        Save the vector index to disk.
        
        Args:
            index_path: Path to save FAISS index
            texts_path: Path to save texts
        """
        self.vector_store.save(index_path, texts_path)
        print(f"Index saved to {index_path}")
    
    def load_index(self, index_path: str, texts_path: str) -> None:
        """
        Load the vector index from disk.
        
        Args:
            index_path: Path to FAISS index file
            texts_path: Path to texts file
        """
        self.vector_store.load(index_path, texts_path)
        self.is_indexed = True
        print(f"Index loaded from {index_path}")
