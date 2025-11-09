"""Kafka consumer worker for processing Gemini tasks"""

import asyncio
import base64
import json
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer

from app.database import AsyncSessionLocal
from app.db_models import Job, JobStatus, TransactionDB
from app.logger import logger
from app.settings import get_settings
from app.worker import GeminiWorker


class KafkaGeminiWorker:
    """Worker that consumes tasks from Kafka and processes them with Gemini"""

    def __init__(self):
        self.settings = get_settings()
        self.gemini_worker = GeminiWorker()
        self.consumer = None
        self.running = False

    async def start(self):
        """Start the Kafka consumer"""
        logger.info(f"Connecting to Kafka at {self.settings.KAFKA_BOOTSTRAP_SERVERS}")

        self.consumer = AIOKafkaConsumer(
            self.settings.KAFKA_TOPIC,
            bootstrap_servers=self.settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=self.settings.KAFKA_GROUP_ID,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )

        await self.consumer.start()
        logger.info(f"Started consuming from topic: {self.settings.KAFKA_TOPIC}")
        self.running = True

        try:
            await self.consume()
        finally:
            await self.stop()

    async def consume(self):
        """Consume messages from Kafka and process them"""
        try:
            async for message in self.consumer:
                if not self.running:
                    break

                logger.info(
                    f"Received message from partition {message.partition}, offset {message.offset}"
                )

                try:
                    task = message.value
                    await self.process_task(task)
                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)
        except asyncio.CancelledError:
            logger.info("Consumer task cancelled")

    async def process_task(self, task: dict):
        """
        Process a task using Gemini and update database

        Expected task format:
        {
            "task_id": "unique_id",
            "task_type": "extract_transactions",
            "filename": "statement.pdf",
            "pdf_content": "base64_encoded_pdf"
        }
        """
        task_id = task.get("task_id", "unknown")
        task_type = task.get("task_type")
        filename = task.get("filename", "unknown.pdf")

        if task_type != "extract_transactions":
            logger.error(f"Task {task_id} has unsupported task_type: {task_type}")
            return

        pdf_content_b64 = task.get("pdf_content")
        if not pdf_content_b64:
            logger.error(f"Task {task_id} missing pdf_content")
            return

        # Update job status to PROCESSING
        async with AsyncSessionLocal() as session:
            job = await session.get(Job, task_id)
            if job:
                job.status = JobStatus.PROCESSING
                job.started_at = datetime.now(timezone.utc)
                await session.commit()
                logger.info(
                    f"Processing transaction extraction task {task_id} for {filename}"
                )
            else:
                logger.error(f"Job {task_id} not found in database")
                return

        try:
            # Decode base64 PDF
            pdf_bytes = base64.b64decode(pdf_content_b64)

            # Extract transactions directly from PDF using Gemini's native support
            transactions = await self.gemini_worker.extract_transactions_from_pdf(
                pdf_bytes
            )

            # Save transactions to database
            async with AsyncSessionLocal() as session:
                transaction_count = len(transactions.transactions)

                # Insert all transactions
                for trans in transactions.transactions:
                    db_transaction = TransactionDB(
                        job_id=task_id,
                        date=trans.date,
                        title=trans.title,
                        amount=trans.amount,
                        currency=trans.currency,
                        category_primary=trans.category_primary,
                        category_detailed=trans.category_detailed,
                        category_confidence_level=trans.category_confidence_level,
                    )
                    session.add(db_transaction)

                # Update job status to COMPLETED
                job = await session.get(Job, task_id)
                if job:
                    job.status = JobStatus.COMPLETED
                    job.completed_at = datetime.now(timezone.utc)
                    job.transaction_count = transaction_count

                await session.commit()

                logger.info(
                    f"Task {task_id} completed: extracted and saved {transaction_count} transactions from {filename}"
                )

        except Exception as e:
            logger.error(f"Error processing task {task_id}: {e}", exc_info=True)

            # Update job status to FAILED
            async with AsyncSessionLocal() as session:
                job = await session.get(Job, task_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.completed_at = datetime.now(timezone.utc)
                    job.error_message = str(e)
                    await session.commit()

    async def stop(self):
        """Stop the Kafka consumer"""
        self.running = False
        if self.consumer:
            await self.consumer.stop()
            logger.info("Kafka consumer stopped")
