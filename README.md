# PARIVYAYA

A tool to analyze your spendings from finance statements. "[Parivyaya](https://www.sanskritdictionary.com/parivyaya/129919/1)" word origin is sanskrit which means expense.

## Features

- **AI-Powered Transaction Extraction**: Upload PDF bank statements and extract transactions using Google's Gemini AI
- **Async Processing**: Kafka-based job queue for processing PDFs in the background
- **Transaction Management**: View, filter, and search all extracted transactions
- **Spending Analysis**: Visualize spending patterns by category and month
- **Real-time Updates**: Live job status tracking in the UI

## Architecture

### Backend (Python/FastAPI)
- FastAPI REST API for transaction management
- Kafka for async job processing
- SQLAlchemy with async PostgreSQL
- Google Gemini AI for PDF parsing and transaction extraction

### Frontend (Next.js)
- React 19 with Next.js 16
- Tailwind CSS for styling
- Real-time job status updates
- Three main views: Upload, Transactions, and Spend Analysis

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Kafka
- Google Gemini API key

### Backend Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt  # or use poetry/pyproject.toml
   ```

2. Configure environment variables (create `.env` file):
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@localhost/parivyaya
   KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   GOOGLE_API_KEY=your_gemini_api_key
   ```

3. Run database migrations:
   ```bash
   # Add your migration command here
   ```

4. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment (`.env.local` already created):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or from project root:
   make ui-dev
   ```

### Using Make Commands

The project includes convenient Make targets:

```bash
make worker       # Build Docker worker image
make ui-dev       # Start UI development server
make ui-build     # Build UI for production
make ui-start     # Start UI production server
make ui-install   # Install UI dependencies
```

## API Endpoints

- `POST /upload` - Upload PDF for transaction extraction
- `GET /jobs` - List all jobs with optional status filter
- `GET /jobs/{job_id}` - Get specific job details
- `GET /transactions` - Query transactions with filters
- `GET /spending/analysis` - Get spending breakdown by category/month

## Usage

1. Start the backend API server
2. Start the UI development server (`make ui-dev`)
3. Open http://localhost:3000
4. Upload a PDF bank statement in the Upload tab
5. Watch the job progress in real-time
6. Once completed, view transactions in the Transactions tab
7. Analyze spending patterns in the Spend Analysis tab

## Development

- Backend code: `app/`
- Frontend code: `ui/src/`
- Data models: `app/models.py`, `app/db_models.py`
- API routes: `app/main.py`
- UI components: `ui/src/components/`
- UI pages: `ui/src/app/`

## License

See LICENSE file for details.
