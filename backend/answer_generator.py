"""
Answer Generation Module

This module generates answers using improved prompting to avoid "I don't know" responses.
Uses google/flan-t5-base for answer generation with flexible context usage.
"""

from typing import List, Tuple
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import re
import logging

logger = logging.getLogger(__name__)


class AnswerGenerator:
    """
    Generates answers from retrieved context using improved prompting strategies.
    
    Attributes:
        tokenizer: Tokenizer for the model
        model: Language model for generation
        device: Device (CPU or CUDA)
    """
    
    def __init__(self, model_name: str = "google/flan-t5-base"):
        """
        Initialize the answer generator.
        
        Args:
            model_name: Name of the model to use (default: google/flan-t5-base)
        """
        print(f"Loading answer generation model: {model_name}")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        self.model.to(self.device)
        self.model.eval()
        print(f"Answer generation model loaded on {self.device}")
    
    def generate_answer(
        self,
        question: str,
        context_chunks: List[Tuple[str, float]],
        max_length: int = 512
    ) -> str:
        """
        Generate an answer from retrieved context using improved prompting.
        
        Args:
            question: User question
            context_chunks: List of (chunk_text, similarity_score) tuples
            max_length: Maximum generation length
            
        Returns:
            Generated answer string
        """
        if not context_chunks:
            return "I couldn't find relevant information to answer this question."
        
        # Construct structured context with scores
        context_text = self._construct_context(context_chunks)
        
        # Create improved prompt
        prompt = self._create_improved_prompt(question, context_text)
        
        # Tokenize
        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True
        ).to(self.device)
        
        # Generate answer with better parameters
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=max_length,
                num_beams=4,
                early_stopping=True,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                no_repeat_ngram_size=2,
                length_penalty=1.2
            )
        
        # Decode answer
        answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Post-process answer
        answer = self._post_process_answer(answer, question, context_text)
        
        return answer
    
    def _construct_context(self, context_chunks: List[Tuple[str, float]]) -> str:
        """
        Construct structured context with similarity scores.
        
        Args:
            context_chunks: List of (chunk_text, similarity_score) tuples
            
        Returns:
            Structured context string
        """
        context_parts = []
        
        for i, (chunk, score) in enumerate(context_chunks, 1):
            # Clean chunk text
            clean_chunk = self._clean_text(chunk)
            
            # Add chunk with score
            context_part = f"[Chunk {i} | relevance: {score:.2f}]\n{clean_chunk}"
            context_parts.append(context_part)
        
        return "\n\n".join(context_parts)
    
    def _create_improved_prompt(self, question: str, context: str) -> str:
        """
        Create an improved prompt that encourages flexible answering.
        
        Args:
            question: User question
            context: Structured context text
            
        Returns:
            Improved prompt string
        """
        prompt = f"""Answer using the context below. The answer may be phrased differently. Extract the most relevant information clearly and concisely.

Context:
{context}

Question: {question}

Answer:"""
        
        return prompt
    
    def _clean_text(self, text: str) -> str:
        """
        Clean text by fixing spacing and formatting.
        
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
        
        # Remove extra spaces at start/end
        text = text.strip()
        
        return text
    
    def _post_process_answer(self, answer: str, question: str, context: str) -> str:
        """
        Post-process answer for readability and relevance.
        
        Args:
            answer: Raw generated answer
            question: Original question
            context: Context used for generation
            
        Returns:
            Processed answer
        """
        if not answer:
            return "I couldn't generate a relevant answer."
        
        # Clean the answer
        answer = self._clean_text(answer)
        
        # Remove common model artifacts
        answer = re.sub(r'^(Answer:|answer:)', '', answer).strip()
        
        # Check for refusal patterns and be more flexible
        refusal_patterns = [
            "i don't know",
            "i do not know", 
            "cannot answer",
            "not enough information",
            "context does not contain",
            "not mentioned",
            "not provided"
        ]
        
        answer_lower = answer.lower()
        if any(pattern in answer_lower for pattern in refusal_patterns):
            # Try to extract partial information instead of refusing
            partial_answer = self._extract_partial_info(context, question)
            if partial_answer:
                return partial_answer
            else:
                return "I couldn't find specific information to answer this question in the provided context."
        
        # Ensure proper formatting
        if answer and not answer[0].isupper():
            answer = answer[0].upper() + answer[1:]
        
        if answer and not answer.endswith(('.', '!', '?')):
            answer += '.'
        
        return answer
    
    def _extract_partial_info(self, context: str, question: str) -> str:
        """
        Attempt to extract partial information from context when full answer isn't available.
        
        Args:
            context: Context text
            question: Original question
            
        Returns:
            Partial answer or empty string
        """
        # Simple keyword-based extraction
        question_words = question.lower().split()
        context_lower = context.lower()
        
        # Find sentences containing question keywords
        sentences = re.split(r'[.!?]', context)
        relevant_sentences = []
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) > 20:
                # Count keyword matches
                matches = sum(1 for word in question_words if word in sentence.lower())
                if matches >= 2:  # At least 2 keyword matches
                    relevant_sentences.append(sentence)
        
        if relevant_sentences:
            # Return the most relevant sentence
            return relevant_sentences[0] + '.'
        
        return ""
