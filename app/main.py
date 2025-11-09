#!/usr/bin/env python

import asyncio
import base64
import json
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

from aiokafka import AIOKafkaProducer
from fastapi import Depends, FastAPI, File, HTTPException, Query, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, init_db
from app.db_models import Job, JobStatus, TransactionDB
from app.kafka_worker import KafkaGeminiWorker
from app.logger import logger
from app.settings import get_settings

settings = get_settings()

# Global Kafka producer and worker
kafka_producer = None
kafka_worker = None
worker_task = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    global kafka_producer, kafka_worker, worker_task

    # Initialize database
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized")

    # Startup: Initialize Kafka producer
    logger.info("Starting Kafka producer...")
    kafka_producer = AIOKafkaProducer(
        bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )
    await kafka_producer.start()
    logger.info("Kafka producer started")

    # Startup: Initialize and start Kafka worker in background
    logger.info("Starting Kafka consumer worker...")
    kafka_worker = KafkaGeminiWorker()
    worker_task = asyncio.create_task(kafka_worker.start())
    logger.info("Kafka consumer worker started in background")

    yield

    # Shutdown: Stop Kafka worker
    logger.info("Stopping Kafka consumer worker...")
    await kafka_worker.stop()
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass
    logger.info("Kafka consumer worker stopped")

    # Shutdown: Close Kafka producer
    logger.info("Stopping Kafka producer...")
    await kafka_producer.stop()
    logger.info("Kafka producer stopped")


app = FastAPI(title="Parivyaya AI API", version="0.1.0", lifespan=lifespan)


# Response models
class JobResponse(BaseModel):
    id: str
    filename: str
    status: str
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None
    error_message: str | None
    transaction_count: int | None

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    id: int
    job_id: str
    date: datetime
    title: str
    amount: float
    currency: str
    category_primary: str
    category_detailed: str
    category_confidence_level: str
    created_at: datetime

    class Config:
        from_attributes = True


class UploadResponse(BaseModel):
    job_id: str
    status: str
    message: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Parivyaya AI API is running"}


@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Upload PDF for async transaction extraction

    Args:
        file: PDF file upload
        db: Database session

    Returns:
        Job ID and status
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        job_id = str(uuid.uuid4())

        # Create job record in database
        job = Job(id=job_id, filename=file.filename, status=JobStatus.PENDING)
        db.add(job)
        await db.commit()

        # Read and encode PDF content
        pdf_content = await file.read()
        pdf_base64 = base64.b64encode(pdf_content).decode("utf-8")

        # Create Kafka task
        task = {
            "task_id": job_id,
            "filename": file.filename,
            "pdf_content": pdf_base64,
            "task_type": "extract_transactions",
        }

        # Send task to Kafka
        await kafka_producer.send(settings.KAFKA_TOPIC, value=task)

        logger.info(f"Queued PDF extraction job {job_id} for {file.filename}")

        return UploadResponse(
            job_id=job_id,
            status="queued",
            message="PDF upload successful. Job queued for processing.",
        )
    except Exception as e:
        logger.error(f"Error uploading PDF: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs", response_model=list[JobResponse])
async def get_jobs(
    status: JobStatus | None = Query(None, description="Filter by job status"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all jobs with optional status filter

    Args:
        status: Optional job status filter
        db: Database session

    Returns:
        List of jobs
    """
    try:
        query = select(Job).order_by(Job.created_at.desc())
        if status:
            query = query.where(Job.status == status)

        result = await db.execute(query)
        jobs = result.scalars().all()

        return [JobResponse.model_validate(job) for job in jobs]
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get job details by ID

    Args:
        job_id: Job ID
        db: Database session

    Returns:
        Job details
    """
    try:
        job = await db.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        return JobResponse.model_validate(job)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching job {job_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    job_id: str | None = Query(None, description="Filter by job ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
):
    """
    Query transactions with optional filters

    Args:
        job_id: Optional job ID filter
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session

    Returns:
        List of transactions
    """
    try:
        query = select(TransactionDB).order_by(TransactionDB.created_at.desc())

        if job_id:
            query = query.where(TransactionDB.job_id == job_id)

        query = query.limit(limit).offset(offset)

        result = await db.execute(query)
        transactions = result.scalars().all()

        return [TransactionResponse.model_validate(t) for t in transactions]
    except Exception as e:
        logger.error(f"Error fetching transactions: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
