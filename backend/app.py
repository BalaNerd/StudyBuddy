"""
Flask Backend API for AI Study Partner

This module provides REST API endpoints for the AI Study Partner application.
It serves the RAG pipeline functionality through HTTP endpoints.
"""
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from pathlib import Path
import os
import logging
from rag_pipeline import RAGPipeline

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global pipeline instance and document storage
pipeline = None
document_store = {
    'current_document': None,
    'chunks': [],
    'full_text': '',
    'filename': '',
    'upload_time': None,
    'settings': {
        'top_k': 8,
        'threshold': 0.2,
        'chunk_size': 900,
        'debug': False
    }
}


def initialize_pipeline():
    """Initialize the RAG pipeline."""
    global pipeline
    if pipeline is None:
        pipeline = RAGPipeline()
    return pipeline


@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    """
    Process uploaded PDF and index it.
    
    Returns:
        JSON response with status message and document data
    """
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF file provided'}), 400
    
    pdf_file = request.files['pdf']
    if pdf_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not pdf_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'File must be a PDF'}), 400
    
    try:
        pipeline = initialize_pipeline()
        
        # Get settings from form data
        settings = document_store['settings'].copy()
        for key in settings.keys():
            if key in request.form:
                try:
                    if key == 'debug':
                        settings[key] = request.form[key].lower() == 'true'
                    else:
                        settings[key] = float(request.form[key])
                except (ValueError, TypeError):
                    pass  # Keep default value if conversion fails
        
        document_store['settings'] = settings
        
        # Save uploaded file temporarily
        upload_dir = Path('uploads')
        upload_dir.mkdir(exist_ok=True)
        temp_path = upload_dir / pdf_file.filename
        pdf_file.save(str(temp_path))
        
        # Process PDF
        chunks, full_text = pipeline.process_pdf(str(temp_path))
        
        # Index documents
        pipeline.index_documents(chunks)
        
        # Store document data globally
        document_store.update({
            'current_document': {
                'name': pdf_file.filename,
                'size': pdf_file.content_length,
                'type': 'application/pdf'
            },
            'chunks': chunks,
            'full_text': full_text,
            'filename': pdf_file.filename,
            'upload_time': pipeline.get_current_time() if hasattr(pipeline, 'get_current_time') else None
        })
        
        # Clean up temporary file
        temp_path.unlink()
        
        message = f"PDF processed successfully!\n\n- Extracted {len(full_text)} characters\n- Created {len(chunks)} chunks\n- Indexed and ready for questions"
        
        return jsonify({
            'message': message,
            'chunks': chunks,
            'text': full_text,
            'chunks_count': len(chunks),
            'characters_count': len(full_text),
            'document_info': {
                'name': pdf_file.filename,
                'size': pdf_file.content_length,
                'chunks': len(chunks),
                'characters': len(full_text)
            }
        })
    
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_path' in locals() and temp_path.exists():
            temp_path.unlink()
        
        return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500


@app.route('/api/ask', methods=['POST'])
def ask_question():
    """Answer a question using the RAG pipeline."""
    try:
        data = request.get_json()
        question = data.get('question', '').strip()
        
        if not question:
            return jsonify({'error': 'Question is required'}), 400
        
        if not document_store.get('current_document'):
            return jsonify({'error': 'No document uploaded. Please upload a PDF first.'}), 400
        
        # Get settings from document store
        settings = document_store.get('settings', {
            'top_k': 8,
            'threshold': 0.2,
            'chunk_size': 900,
            'debug': False
        })
        
        # Log debug info if enabled
        if settings.get('debug', False):
            logger.info(f"Processing question: {question}")
            logger.info(f"Using settings: {settings}")
        
        # Answer question with improved parameters
        answer, retrieved_chunks = pipeline.answer_question(
            question, 
            k=settings.get('top_k', 8),
            min_similarity=settings.get('threshold', 0.2)
        )
        
        # Format context for frontend
        context = []
        for chunk, similarity in retrieved_chunks:
            context.append({
                'text': chunk,
                'similarity': float(similarity)
            })
        
        response_data = {
            'answer': answer,
            'context': context,
            'question': question
        }
        
        # Log debug info if enabled
        if settings.get('debug', False):
            logger.info(f"Generated answer: {answer}")
            logger.info(f"Retrieved {len(context)} chunks")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        return jsonify({'error': f'Failed to answer question: {str(e)}'}), 500


@app.route('/api/summarize', methods=['POST'])
def summarize_document():
    """
    Summarize the currently loaded document.
    
    Returns:
        JSON response with summary text
    """
    # Check if document is loaded
    if not document_store['current_document']:
        return jsonify({'error': 'No document uploaded. Please upload a document first.'}), 400
    
    try:
        pipeline = initialize_pipeline()
        
        # Generate summary from stored text
        summary = pipeline.summarize_documents(document_store['full_text'])
        
        return jsonify({
            'summary': summary
        })
    
    except Exception as e:
        return jsonify({'error': f'Error generating summary: {str(e)}'}), 500


@app.route('/api/document/status', methods=['GET'])
def get_document_status():
    """
    Get the status of the current document.
    
    Returns:
        JSON response with document status and info
    """
    if not document_store['current_document']:
        return jsonify({
            'has_document': False,
            'status': 'no_document',
            'message': 'No document uploaded'
        })
    
    return jsonify({
        'has_document': True,
        'status': 'ready',
        'document_info': {
            'name': document_store['current_document']['name'],
            'size': document_store['current_document']['size'],
            'chunks': len(document_store['chunks']),
            'characters': len(document_store['full_text']),
            'upload_time': document_store['upload_time']
        },
        'settings': document_store['settings']
    })


@app.route('/api/settings', methods=['GET', 'POST'])
def manage_settings():
    """
    Get or update application settings.
    
    Returns:
        JSON response with current settings
    """
    if request.method == 'GET':
        return jsonify({
            'settings': document_store['settings']
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No settings provided'}), 400
        
        # Update settings
        for key, value in data.items():
            if key in document_store['settings']:
                try:
                    if key == 'debug':
                        document_store['settings'][key] = bool(value)
                    else:
                        document_store['settings'][key] = float(value)
                except (ValueError, TypeError):
                    return jsonify({'error': f'Invalid value for {key}'}), 400
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': document_store['settings']
        })


@app.route('/api/document/clear', methods=['POST'])
def clear_document():
    """
    Clear the current document from memory.
    
    Returns:
        JSON response with status
    """
    global document_store
    
    # Clear document store
    document_store = {
        'current_document': None,
        'chunks': [],
        'full_text': '',
        'filename': '',
        'upload_time': None,
        'settings': document_store['settings']  # Keep settings
    }
    
    # Reset pipeline if needed
    if pipeline and hasattr(pipeline, 'clear_index'):
        pipeline.clear_index()
    
    return jsonify({
        'message': 'Document cleared successfully',
        'status': 'cleared'
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with service status
    """
    return jsonify({
        'status': 'healthy',
        'service': 'AI Study Partner API',
        'pipeline_initialized': pipeline is not None,
        'document_loaded': document_store['current_document'] is not None
    })


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large'}), 413


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server error."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Initialize pipeline
    initialize_pipeline()
    
    # Create uploads directory if it doesn't exist
    Path('uploads').mkdir(exist_ok=True)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
