#!/usr/bin/env python

import asyncio
import json
from contextlib import asynccontextmanager

from aiokafka import AIOKafkaProducer
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.kafka_worker import KafkaGeminiWorker
from app.logger import logger
from app.routes import jobs, spending, transactions
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

    # Store kafka_producer in app state so routes can access it
    app.state.kafka_producer = kafka_producer

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Parivyaya AI API is running"}


# Include routers
app.include_router(jobs.router)
app.include_router(transactions.router)
app.include_router(spending.router)
