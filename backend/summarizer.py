"""
Summarization Module

This module provides improved text summarization using BART-large-CNN.
Includes text cleaning, proper truncation, and post-processing for readable output.
"""

from typing import List
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
import logging

logger = logging.getLogger(__name__)


class Summarizer:
    """
    Generates summaries of text using BART-large-CNN model with improved processing.
    
    Attributes:
        tokenizer: Tokenizer for the model
        model: BART model for summarization
        device: Device (CPU or CUDA)
    """
    
    def __init__(self, model_name: str = "facebook/bart-large-cnn"):
        """
        Initialize the summarizer.
        
        Args:
            model_name: Name of the model to use (default: facebook/bart-large-cnn)
        """
        print(f"Loading summarization model: {model_name}")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()
        print(f"Summarization model loaded on {self.device}")
    
    def summarize(self, text: str, max_length: int = 150, min_length: int = 50) -> str:
        """
        Generate a summary of the input text with improved processing.
        
        Args:
            text: Input text to summarize
            max_length: Maximum length of summary
            min_length: Minimum length of summary
            
        Returns:
            Generated summary string
        """
        if not text or not text.strip():
            return "No text provided for summarization."
        
        # Clean input text
        cleaned_text = self._clean_text(text)
        
        if len(cleaned_text.strip()) < 100:
            return "Text too short for meaningful summarization."
        
        # Handle very long texts by chunking
        max_input_length = 1024  # BART's max input length
        
        # Tokenize to check length
        inputs = self.tokenizer(
            cleaned_text,
            return_tensors="pt",
            truncation=True,
            max_length=max_input_length,
            padding=True
        ).to(self.device)
        
        # Generate summary with improved parameters
        with torch.no_grad():
            summary_ids = self.model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=max_length,
                min_length=min_length,
                num_beams=4,
                early_stopping=True,
                length_penalty=2.0,
                do_sample=False,
                temperature=1.0,
                no_repeat_ngram_size=3
            )
        
        # Decode summary
        summary = self.tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        
        # Post-process summary for readability
        summary = self._post_process_summary(summary)
        
        return summary
    
    def summarize_chunks(self, chunks: List[str]) -> str:
        """
        Summarize multiple text chunks by combining them intelligently.
        
        Args:
            chunks: List of text chunks
            
        Returns:
            Combined summary
        """
        if not chunks:
            return "No content to summarize."
        
        # Clean and filter chunks
        cleaned_chunks = []
        for chunk in chunks:
            cleaned = self._clean_text(chunk)
            if len(cleaned.strip()) > 50:  # Only include meaningful chunks
                cleaned_chunks.append(cleaned)
        
        if not cleaned_chunks:
            return "No meaningful content to summarize."
        
        # If we have too much content, create a hierarchical summary
        total_length = sum(len(chunk) for chunk in cleaned_chunks)
        
        if total_length > 4000:
            # For very long documents, summarize chunks first, then summarize the summaries
            chunk_summaries = []
            for chunk in cleaned_chunks[:10]:  # Limit to first 10 chunks
                chunk_summary = self.summarize(chunk, max_length=100, min_length=30)
                if chunk_summary and len(chunk_summary) > 20:
                    chunk_summaries.append(chunk_summary)
            
            if chunk_summaries:
                combined_summaries = " ".join(chunk_summaries)
                return self.summarize(combined_summaries, max_length=150, min_length=50)
        
        # For moderate length documents, combine and summarize
        combined_text = " ".join(cleaned_chunks)
        return self.summarize(combined_text)
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text by fixing spacing, formatting, and common issues.
        
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
        
        # Remove very short lines/fragments
        lines = text.split('. ')
        meaningful_lines = [line.strip() for line in lines if len(line.strip()) > 10]
        text = '. '.join(meaningful_lines)
        
        return text
    
    def _post_process_summary(self, summary: str) -> str:
        """
        Post-process summary for better readability and formatting.
        
        Args:
            summary: Raw summary from model
            
        Returns:
            Processed summary
        """
        if not summary:
            return "No summary could be generated."
        
        # Clean spacing
        summary = self._clean_text(summary)
        
        # Fix sentence boundaries and capitalization
        sentences = re.split(r'([.!?])', summary)
        processed_sentences = []
        
        for i in range(0, len(sentences), 2):
            if i < len(sentences):
                sentence = sentences[i].strip()
                if sentence:
                    # Capitalize first letter
                    sentence = sentence[0].upper() + sentence[1:] if sentence else sentence
                    processed_sentences.append(sentence)
                    
                    # Add punctuation back if it exists
                    if i + 1 < len(sentences):
                        processed_sentences.append(sentences[i + 1])
        
        # Join processed sentences
        processed_summary = ''.join(processed_sentences)
        
        # Final cleanup
        processed_summary = re.sub(r'\s+', ' ', processed_summary)
        processed_summary = processed_summary.strip()
        
        # Ensure proper ending
        if processed_summary and not processed_summary.endswith(('.', '!', '?')):
            processed_summary += '.'
        
        # Remove any remaining artifacts
        processed_summary = re.sub(r'\s+([,.!?])', r'\1', processed_summary)
        
        return processed_summary
