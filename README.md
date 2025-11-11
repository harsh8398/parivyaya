# PARIVYAYA

A tool to analyze your spending from financial statements using AI. "[Parivyaya](https://www.sanskritdictionary.com/parivyaya/129919/1)" is a Sanskrit word meaning "expense."

> **🌐 [View Live Demo](https://parivyaya.augmntd.ai)**

![Upload Screenshot](screenshots/demo.png)

## Features

- AI-powered transaction extraction from PDF bank statements (Google Gemini + LangChain)
- Async processing with Kafka job queue
- Transaction management with filtering and search
- Spending analysis by category and time period
- Real-time job status updates

## Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[Next.js App<br/>React 19 + TypeScript]
        Upload[Upload Page]
        Transactions[Transactions Page]
        Analysis[Analysis Page]
        
        UI --> Upload
        UI --> Transactions
        UI --> Analysis
    end
    
    subgraph "Backend (FastAPI)"
        API[FastAPI REST API<br/>Python 3.14]
        Routes[Route Handlers]
        DB_Layer[SQLAlchemy ORM<br/>Async]
        
        API --> Routes
        Routes --> DB_Layer
    end
    
    subgraph "Async Processing"
        Kafka[Apache Kafka 4.1.1<br/>Message Queue]
        Worker[Kafka Worker<br/>Consumer]
        Gemini[Google Gemini AI<br/>via LangChain]
        
        Worker --> Kafka
        Worker --> Gemini
        Worker --> DB_Layer
    end
    
    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL 17<br/>Database)]
        Alembic[Alembic<br/>Migrations]
        
        DB_Layer --> PostgreSQL
        Alembic -.-> PostgreSQL
    end
    
    UI -->|HTTP/REST| API
    Upload -->|POST /upload| API
    Transactions -->|GET /transactions| API
    Analysis -->|GET /spending/analysis| API
    
    Routes -->|Job Creation| Kafka
    Gemini -->|Extract Transactions<br/>Classify Categories| Worker
    
    style UI fill:#61dafb,stroke:#333,stroke-width:2px
    style API fill:#009688,stroke:#333,stroke-width:2px
    style Kafka fill:#231f20,stroke:#333,stroke-width:2px,color:#fff
    style PostgreSQL fill:#336791,stroke:#333,stroke-width:2px,color:#fff
    style Gemini fill:#8e75b2,stroke:#333,stroke-width:2px
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Google Gemini API key

### Using Docker Compose

1. Set your Google API key and start services:
   ```bash
   export GOOGLE_API_KEY=your_gemini_api_key
   make up
   ```

2. Access the application:
   - UI: http://localhost:3000
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

3. Stop services:
   ```bash
   make down
   ```

## Development Setup

For local development without Docker:

### Backend


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
   NEXT_PUBLIC_DEMO_MODE=false
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

Full API documentation available at: http://localhost:8000/docs

Key endpoints:
- `POST /upload` - Upload PDF for transaction extraction
- `GET /jobs` - List all jobs
- `GET /transactions` - Query transactions with pagination
- `GET /spending/analysis` - Get spending breakdown by category

## Make Commands

```bash
make dev        # Start UI in development mode
make build      # Build all Docker images
make up         # Start all services with docker-compose
make down       # Stop all services
make logs       # Show docker-compose logs
make clean-db   # Stop services and delete postgres data
make help       # Show all available commands
```

## License

See LICENSE file for details.
