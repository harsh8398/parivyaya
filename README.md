# PARIVYAYA

A tool to analyze your spending from financial statements. "[Parivyaya](https://www.sanskritdictionary.com/parivyaya/129919/1)" is a Sanskrit word meaning "expense."

## Features

- **AI-Powered Transaction Extraction**: Upload PDF bank statements and extract transactions using Google's Gemini AI with LangChain
- **Async Processing**: Kafka-based job queue for processing PDFs in the background
- **Transaction Management**: View, filter, and search all extracted transactions
- **Spending Analysis**: Visualize spending patterns by category and month
- **Real-time Updates**: Live job status tracking in the UI
- **Delete Jobs**: Remove jobs and their associated transactions

## Architecture

### Backend (Python/FastAPI)
- FastAPI REST API for transaction management
- Apache Kafka 4.1.1 for async job processing
- SQLAlchemy with async PostgreSQL 17
- Google Gemini AI via LangChain for PDF parsing and transaction extraction
- Alembic for database migrations

### Frontend (Next.js)
- React 19 with Next.js 16
- Tailwind CSS v4 for styling
- TypeScript for type safety
- Real-time job status updates
- Three main views: Upload, Transactions, and Analysis

### Infrastructure
- Docker Compose for local development
- Kubernetes manifests for production deployment
- PostgreSQL for data persistence
- Kafka for message queuing

## Quick Start

### Using Docker Compose (Recommended)

1. Set your Google API key:
   ```bash
   export GOOGLE_API_KEY=your_gemini_api_key
   ```

2. Start all services:
   ```bash
   make up
   ```

3. Access the application:
   - UI: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. Stop services:
   ```bash
   make down
   ```

### Using Kubernetes (kind)

1. Build and deploy:
   ```bash
   make deploy
   ```

2. Access the application:
   ```bash
   kubectl port-forward -n parivyaya svc/ui 3000:3000
   ```

3. Clean up:
   ```bash
   make clean
   ```

## Development Setup

### Prerequisites
- Python 3.14+
- Node.js 20+
- Docker & Docker Compose (for containerized setup)
- Google Gemini API key

### Local Backend Development

1. Install Python dependencies:
   ```bash
   pip install -e .
   # or using uv:
   uv pip install -e .
   ```

2. Set environment variables:
   ```bash
   export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/parivyaya
   export KAFKA_BOOTSTRAP_SERVERS=localhost:9092
   export GOOGLE_API_KEY=your_gemini_api_key
   ```

3. Start PostgreSQL and Kafka (via Docker):
   ```bash
   docker-compose up postgres broker -d
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Local Frontend Development

1. Navigate to UI directory:
   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or from project root:
   make dev
   ```

## Available Make Commands

```bash
make dev        # Start UI in development mode
make build      # Build all Docker images
make up         # Start all services with docker-compose
make down       # Stop all services
make deploy     # Deploy to Kubernetes (kind)
make logs       # Show application logs
make psql       # Open PostgreSQL shell
make clean      # Clean up all resources
make help       # Show all available commands
```

## API Endpoints

### Health Check
- `GET /` - API health check

### Jobs
- `POST /upload` - Upload PDF for transaction extraction
- `GET /jobs` - List all jobs with optional status filter (`?status=pending|processing|completed|failed`)
- `GET /jobs/{job_id}` - Get specific job details
- `DELETE /jobs/{job_id}` - Delete a job and its transactions

### Transactions
- `GET /transactions` - Query transactions with pagination
  - Query params: `job_id` (optional), `limit` (1-1000, default 100), `offset` (default 0)

### Analysis
- `GET /spending/analysis` - Get spending breakdown by category per month
  - Query params: `category_type` (`primary` or `detailed`, default `detailed`)

Full API documentation available at: http://localhost:8000/docs (when running)

## Usage

1. **Using Docker Compose:**
   ```bash
   export GOOGLE_API_KEY=your_key
   make up
   ```
   Access UI at http://localhost:3000

2. **Upload & Analyze:**
   - Navigate to the Upload tab
   - Upload a PDF bank statement
   - Watch job progress in real-time
   - View extracted transactions in the Transactions tab
   - Analyze spending patterns in the Analysis tab

3. **Clean up:**
   ```bash
   make down  # Docker Compose
   # or
   make clean # Complete cleanup including Kubernetes
   ```

## Project Structure

```
parivyaya/
├── app/                    # Backend application
│   ├── main.py            # FastAPI application & routes
│   ├── database.py        # Database connection & session management
│   ├── db_models.py       # SQLAlchemy ORM models
│   ├── models.py          # Pydantic models for validation
│   ├── kafka_worker.py    # Kafka consumer & Gemini AI integration
│   ├── worker.py          # Background worker logic
│   ├── settings.py        # Configuration management
│   └── logger.py          # Logging setup
├── ui/                    # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js app router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client & utilities
│   │   └── types/        # TypeScript types
├── k8s/                   # Kubernetes manifests
├── data/                  # Sample data & test files
├── docker-compose.yaml    # Local development setup
├── Dockerfile.worker      # Backend container image
├── Dockerfile.ui          # Frontend container image
├── pyproject.toml         # Python dependencies
└── Makefile              # Convenience commands
```

## Technologies

**Backend:**
- Python 3.14
- FastAPI (async web framework)
- SQLAlchemy (async ORM)
- PostgreSQL 17 (database)
- Apache Kafka 4.1.1 (message queue)
- LangChain + Google Gemini AI (PDF processing)
- Alembic (database migrations)

**Frontend:**
- Next.js 16 (React framework)
- React 19 (UI library)
- TypeScript 5 (type safety)
- Tailwind CSS v4 (styling)

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes
- kind (local Kubernetes)

## License

See LICENSE file for details.
