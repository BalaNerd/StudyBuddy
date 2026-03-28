"""
Text Chunking Module

This module implements improved sentence-aware text chunking for RAG pipelines.
Chunks are created with ~900 tokens and ~180 token overlap for better context preservation.
"""

import re
from typing import List, Tuple
from transformers import AutoTokenizer


class TextChunker:
    """
    Handles text chunking with sentence awareness and improved token-based sizing.
    
    Attributes:
        chunk_size: Target chunk size in tokens (900)
        chunk_overlap: Overlap between chunks in tokens (180)
        tokenizer: Tokenizer for counting tokens
    """
    
    def __init__(self, chunk_size: int = 900, chunk_overlap: int = 180, model_name: str = "sentence-transformers/all-mpnet-base-v2"):
        """
        Initialize the text chunker.
        
        Args:
            chunk_size: Target size of each chunk in tokens (default: 900)
            chunk_overlap: Overlap between chunks in tokens (default: 180)
            model_name: Model name for tokenizer (default: all-mpnet-base-v2)
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks with improved sentence awareness.
        
        Strategy:
        1. Clean and normalize text
        2. Split into sentences with better boundary detection
        3. Group sentences into chunks that don't exceed chunk_size
        4. Add overlap between chunks to preserve context
        5. Ensure clean sentence boundaries
        
        Args:
            text: Input text to chunk
            
        Returns:
            List of text chunks
        """
        if not text or not text.strip():
            return []
        
        # Clean text first
        text = self._clean_text(text)
        
        # Split into sentences with improved detection
        sentences = self._split_sentences(text)
        
        if not sentences:
            return [text]
        
        # Filter out very short sentences
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        if not sentences:
            return [text]
        
        chunks = []
        current_chunk = []
        current_tokens = 0
        
        for sentence in sentences:
            sentence_tokens = len(self.tokenizer.encode(sentence, add_special_tokens=False))
            
            # If adding this sentence would exceed chunk size, finalize current chunk
            if current_tokens + sentence_tokens > self.chunk_size and current_chunk:
                chunk_text = " ".join(current_chunk)
                # Clean up chunk boundaries
                chunk_text = self._clean_chunk_boundaries(chunk_text)
                chunks.append(chunk_text)
                
                # Start new chunk with overlap
                current_chunk, current_tokens = self._create_overlap_chunk(chunk_text)
            
            # Add sentence to current chunk
            current_chunk.append(sentence)
            current_tokens += sentence_tokens
        
        # Add final chunk if it exists
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            chunk_text = self._clean_chunk_boundaries(chunk_text)
            chunks.append(chunk_text)
        
        # Ensure we have at least one chunk
        if not chunks:
            chunks = [text]
        
        # Filter out very short chunks
        chunks = [chunk for chunk in chunks if len(chunk.strip()) > 50]
        
        return chunks
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text by fixing spacing and formatting issues.
        
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
        text = re.sub(r'([,.!?;:])\s*', r'\1 ', text)
        
        # Fix common OCR/extraction issues
        text = re.sub(r'([a-z])([A-Z])', r'\1. \2', text)
        
        # Remove extra spaces at start/end
        text = text.strip()
        
        return text
    
    def _split_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences using improved regex patterns.
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        # Enhanced pattern for sentence boundaries
        # Handles: . ? ! followed by space and capital letter or quote
        # Also handles common abbreviations and decimal numbers
        sentence_pattern = r'(?<=[.!?])\s+(?=[A-Z"]|\d)'
        
        sentences = re.split(sentence_pattern, text)
        
        # Clean up sentences
        cleaned_sentences = []
        for sent in sentences:
            sent = sent.strip()
            if sent and len(sent) > 10:  # Filter very short fragments
                cleaned_sentences.append(sent)
        
        return cleaned_sentences if cleaned_sentences else [text]
    
    def _create_overlap_chunk(self, chunk_text: str) -> Tuple[List[str], int]:
        """
        Create overlap for next chunk by taking last sentences from current chunk.
        
        Args:
            chunk_text: Current chunk text
            
        Returns:
            Tuple of (overlap sentences list, token count)
        """
        sentences = self._split_sentences(chunk_text)
        
        # Take last sentences that fit within overlap size
        overlap_sentences = []
        overlap_tokens = 0
        
        for sentence in reversed(sentences):
            sentence_tokens = len(self.tokenizer.encode(sentence, add_special_tokens=False))
            
            if overlap_tokens + sentence_tokens <= self.chunk_overlap:
                overlap_sentences.insert(0, sentence)
                overlap_tokens += sentence_tokens
            else:
                break
        
        return overlap_sentences, overlap_tokens
    
    def _clean_chunk_boundaries(self, chunk_text: str) -> str:
        """
        Clean chunk boundaries to ensure proper sentence endings.
        
        Args:
            chunk_text: Chunk text to clean
            
        Returns:
            Cleaned chunk text
        """
        if not chunk_text:
            return ""
        
        # Remove trailing fragments (incomplete sentences)
        sentences = self._split_sentences(chunk_text)
        if sentences and len(sentences) > 1:
            # Check if last sentence is incomplete (no ending punctuation)
            last_sentence = sentences[-1]
            if not re.search(r'[.!?]$', last_sentence):
                # Remove incomplete last sentence
                sentences = sentences[:-1]
        
        # Rejoin sentences
        cleaned_text = " ".join(sentences)
        
        # Ensure proper spacing
        cleaned_text = self._clean_text(cleaned_text)
        
        return cleaned_text
