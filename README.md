# AI Study Partner - StudyBuddy

> **Modern RAG-Powered Document Q&A**

A production-ready RAG (Retrieval-Augmented Generation) system with a beautiful React frontend and Flask backend. Intelligently answers questions from your PDF documents with accurate, context-aware responses.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🎨 **Premium UI** | Modern React + Tailwind CSS interface with glassmorphism design |
| 📄 **PDF Processing** | Extract and process text from multi-page PDFs |
| 🔍 **Enhanced Search** | Semantic search with `all-mpnet-base-v2` embeddings |
| 💡 **Smart Answers** | Flexible prompting that avoids "I don't know" when possible |
| 📋 **Auto Summarization** | Clean, readable summaries with BART-large-cnn |
| 🌗 **Dark Mode** | Beautiful light/dark theme with smooth transitions |
| ⚙️ **Configurable** | Adjustable AI parameters (top_k, threshold, chunk_size) |
| 🔄 **Global State** | Zustand state management with document persistence |

---

## 🏗️ Architecture

### Modern Full-Stack Design

```
┌─────────────────────────────────────────────────────────┐
│                   React Frontend                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Upload    │ │   QA Chat   │ │ Summarizer  │       │
│  │   Section   │ │   Section   │ │   Section   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│         ┌─────────────┐ ┌─────────────┐               │
│         │   Settings  │ │   Sidebar   │               │
│         │   Section   │ │ Navigation │               │
│         └─────────────┘ └─────────────┘               │
└────────────────────┬────────────────────────────────────┘
                     ↓ REST API
┌─────────────────────────────────────────────────────────┐
│                  Flask Backend                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Upload    │ │     QA      │ │  Summarize  │       │
│  │   Endpoint  │ │  Endpoint   │ │  Endpoint   │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│         ┌─────────────┐ ┌─────────────┐               │
│         │   Settings  │ │   Document  │               │
│         │  Endpoint   │ │   Status    │               │
│         └─────────────┘ └─────────────┘               │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│                RAG Pipeline                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │   Embed     │ │   Vector    │ │   Retrieve   │       │
│  │  Generator  │ │    Store    │ │     -er      │       │
│  └─────────────┘ └─────────────┘ └─────────────┘       │
│         ┌─────────────┐ ┌─────────────┐               │
│         │   Answer    │ │  Summarizer │               │
│         │ Generator   │ │             │               │
│         └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- ⚛️ **React 18** - Modern UI framework
- 🎨 **Tailwind CSS** - Utility-first styling with glassmorphism
- 🔄 **Zustand** - Lightweight state management
- 🌗 **Theme Context** - Dark/light mode with persistence
- 📱 **Responsive Design** - Mobile-first approach

**Backend:**
- 🌶️ **Flask** - Lightweight REST API
- 🔍 **FAISS** - High-performance vector search
- 🤖 **Transformers** - HuggingFace models
- 🧠 **PyTorch** - Deep learning framework

**AI Models:**
- 🎯 **all-mpnet-base-v2** - 768-dim semantic embeddings
- 💬 **google/flan-t5-base** - Flexible answer generation
- 📝 **facebook/bart-large-cnn** - Clean summarization

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Installation (5 Steps)

**1. Clone the repository:**
```bash
git clone https://github.com/Vagvedi/StudyBuddy.git
cd StudyBuddy
```

**2. Setup Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**3. Setup Frontend:**
```bash
cd ../frontend
npm install
```

**4. Start Backend:**
```bash
cd ../backend
python app.py
```

**5. Start Frontend:**
```bash
cd ../frontend
npm start
```

**6. Open in browser:**
```bash
http://localhost:3000
```

---

## 🎯 How to Use

### 1. Upload Document
- 📤 Drag & drop or click to upload PDF
- ⚙️ Configure AI parameters (optional)
- 🔄 Click "Process Document"
- ✅ See processing status and results

### 2. Ask Questions
- 💬 Type your question in the chat interface
- 🔍 View retrieved context with relevance scores
- 💡 Get intelligent answers from your document
- 📊 See similarity scores for transparency

### 3. Generate Summary
- 📋 Click "Generate Summary" button
- ⏱️ Wait for AI to process your document
- 📝 Get clean, readable summary
- 📊 View summary statistics (words, characters, etc.)

### 4. Configure Settings
- ⚙️ Adjust AI parameters:
  - **Top-K Results**: 1-10 chunks to retrieve
  - **Similarity Threshold**: 0.1-1.0 minimum relevance
  - **Chunk Size**: 500-2000 tokens per chunk
  - **Debug Mode**: Show detailed processing info
- 🌗 Toggle between light/dark themes
- 💾 Settings persist across sessions

---

## 🔧 Advanced Configuration

### Backend Settings

Edit `backend/app.py` to customize:

```python
# Default AI parameters
DEFAULT_SETTINGS = {
    'top_k': 8,           # Retrieved chunks
    'threshold': 0.2,     # Similarity threshold
    'chunk_size': 900,    # Tokens per chunk
    'debug': False        # Debug mode
}

# Model selection
pipeline = RAGPipeline(
    embedding_model="sentence-transformers/all-mpnet-base-v2",
    answer_model="google/flan-t5-base", 
    summarizer_model="facebook/bart-large-cnn",
    chunk_size=900,
    chunk_overlap=180
)
```

### Frontend Customization

Edit `frontend/src/tailwind.config.js`:

```javascript
// Custom theme colors
theme: {
  extend: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899'
    }
  }
}
```

---

## 📂 Project Structure

```
StudyBuddy/
│
├── 🎨 Frontend (React)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AskSection.js
│   │   │   ├── SummarizeSection.js
│   │   │   ├── UploadSection.js
│   │   │   ├── SettingsSection.js
│   │   │   ├── Sidebar.js
│   │   │   └── DocumentHeader.js
│   │   ├── contexts/           # React contexts
│   │   │   └── ThemeContext.js
│   │   ├── stores/             # Zustand stores
│   │   │   └── documentStore.js
│   │   ├── App.js             # Main app component
│   │   └── index.js           # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── 🌶️ Backend (Flask)
│   ├── rag_pipeline.py        # Main RAG orchestrator
│   ├── embeddings.py          # Embedding generation
│   ├── vector_store.py        # FAISS vector database
│   ├── text_chunker.py        # Smart text chunking
│   ├── answer_generator      # Answer generation
│   ├── summarizer.py          # Document summarization
│   ├── pdf_processor.py       # PDF text extraction
│   ├── app.py                 # Flask API server
│   └── requirements.txt       # Python dependencies
│
├── 📖 Documentation
│   ├── README.md              # This file
│   └── PROJECT_STRUCTURE.md   # Detailed structure
│
└── 🚀 Deployment
    ├── start.bat              # Windows startup script
    └── .gitignore            # Git ignore rules
```

---

## 🎨 UI Features

### Glassmorphism Design
- 🪟 Translucent cards with backdrop blur
- 🌈 Smooth color transitions
- ✨ Subtle animations and micro-interactions
- 📱 Fully responsive layout

### Interactive Elements
- 🔄 Loading spinners with smooth animations
- 📊 Progress indicators for document processing
- 🎯 Hover effects and active states
- 📋 Collapsible context sections

### Theme System
- 🌞 **Light Mode**: Clean, bright interface
- 🌙 **Dark Mode**: Easy on the eyes for long sessions
- 🔄 **Auto Switch**: Follows system preference
- 💾 **Persistence**: Remembers your choice

---

## 🧠 AI Improvements

### Enhanced Retrieval
- ✅ **Better Embeddings**: `all-mpnet-base-v2` (768-dim vs 384-dim)
- ✅ **Cosine Similarity**: Direct inner product with normalized vectors
- ✅ **Flexible Threshold**: Lower threshold (0.2) for more results
- ✅ **Always Answer**: Attempts partial answers instead of refusing

### Improved Chunking
- ✅ **Larger Chunks**: 900 tokens (vs 500) for better context
- ✅ **More Overlap**: 180 tokens (vs 100) to preserve information
- ✅ **Clean Boundaries**: Removes incomplete sentences
- ✅ **Quality Filter**: Filters out very short chunks

### Smart Answering
- ✅ **Flexible Prompting**: "Answer may be phrased differently"
- ✅ **Partial Information**: Extracts relevant info when full answer unavailable
- ✅ **Clean Output**: Fixes spacing, capitalization, formatting
- ✅ **Context Scores**: Shows relevance transparency

### Readable Summaries
- ✅ **Input Cleaning**: Fixes spacing before processing
- ✅ **Hierarchical**: Handles very long documents intelligently
- ✅ **Post-Processing**: Proper capitalization and sentence structure
- ✅ **Statistics**: Shows word count, reading time, etc.

---

## 📊 Performance

| Component | Speed | Model Size | Memory |
|-----------|-------|------------|--------|
| **Embeddings** | ~2ms per chunk | 420 MB | Low |
| **Retrieval** | ~5-10ms (8 chunks) | In-memory | Variable |
| **Answer Gen** | ~1-2s per question | 990 MB | ~2 GB |
| **Summarization** | ~3-5s per doc | 1.6 GB | ~2 GB |

*Measured on CPU; GPU would be 5-10x faster*

---

## 🛠️ API Endpoints

### Document Management
- `POST /api/upload` - Upload and process PDF
- `GET /api/document/status` - Get current document status
- `POST /api/document/clear` - Clear stored document

### Question Answering
- `POST /api/ask` - Ask questions about uploaded document
- `POST /api/summarize` - Generate document summary

### Settings
- `GET /api/settings` - Get current AI parameters
- `POST /api/settings` - Update AI parameters

### Health Check
- `GET /api/health` - Check system status

---

## 🔧 Development

### Adding New Features

**1. Frontend Components:**
```javascript
// src/components/NewFeature.js
import React from 'react';

const NewFeature = () => {
  return <div>New Feature Content</div>;
};

export default NewFeature;
```

**2. Backend Endpoints:**
```python
@app.route('/api/new-feature', methods=['POST'])
def new_feature():
    data = request.get_json()
    # Process data
    return jsonify({'result': 'success'})
```

**3. State Management:**
```javascript
// src/stores/newStore.js
import { create } from 'zustand';

const useNewStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export default useNewStore;
```

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |

---

## 🚀 Deployment

### Docker Deployment

**1. Build Backend:**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

**2. Build Frontend:**
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
```

**3. Docker Compose:**
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

---

## 🔒 Security Considerations

- ✅ **CORS Protection**: Configured for frontend domain
- ✅ **File Validation**: PDF only, size limits enforced
- ✅ **Input Sanitization**: All inputs validated and cleaned
- ✅ **No Direct File Access**: Files processed in memory only
- ✅ **Error Handling**: Graceful error responses, no stack traces

---

## 📈 Future Enhancements

### Planned Features
- 📚 **Multi-PDF Support**: Search across multiple documents
- 💬 **Chat History**: Conversation memory and context
- 🎯 **Document Re-ranking**: Better retrieval with re-ranking
- 📊 **Analytics**: Usage statistics and insights
- 🔐 **User Authentication**: Multi-user support
- 📱 **Mobile App**: React Native version

### AI Improvements
- 🧠 **Larger Models**: Support for GPT-4, Claude, etc.
- 🔍 **Hybrid Search**: Combine semantic + keyword search
- 📝 **Fine-tuning**: Custom models for specific domains
- 🎯 **Reranking**: Cross-encoder for better relevance
- 🌐 **Multilingual**: Support for multiple languages

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with:
- 🤗 **HuggingFace** - Transformer models and datasets
- 🔎 **FAISS** - Facebook AI's similarity search library
- ⚛️ **React** - Modern UI framework
- 🌶️ **Flask** - Lightweight web framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧠 **PyTorch** - Deep learning framework

---

## 📞 Support

- 📧 **Email**: vagved@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Vagvedi/StudyBuddy/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Vagvedi/StudyBuddy/discussions)

---

<p align="center">
  <b>🎯 Built with passion for better learning experiences</b>
  <br>
  <b>⭐ Star this repo if it helps you study smarter!</b>
</p>
