"""Job-related API routes"""

import base64
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Query, Request, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api_models import JobResponse, UploadResponse
from app.database import get_db
from app.db_models import Job, JobStatus, TransactionDB
from app.logger import logger

router = APIRouter(tags=["jobs"])


@router.post("/upload", response_model=UploadResponse)
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload PDF for async transaction extraction

    Args:
        request: FastAPI request object (for accessing app state)
        file: PDF file upload
        db: Database session

    Returns:
        Job ID and status
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    try:
        from app.settings import get_settings

        settings = get_settings()
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

        # Send task to Kafka using producer from app state
        kafka_producer = request.app.state.kafka_producer
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


@router.get("/jobs", response_model=list[JobResponse])
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


@router.get("/jobs/{job_id}", response_model=JobResponse)
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


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """
    Delete a job and all its associated transactions

    Args:
        job_id: Job ID
        db: Database session

    Returns:
        Success message
    """
    try:
        # Check if job exists
        job = await db.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Delete all transactions for this job
        delete_stmt = delete(TransactionDB).where(TransactionDB.job_id == job_id)
        result = await db.execute(delete_stmt)
        transactions_deleted = result.rowcount

        # Delete the job
        await db.delete(job)
        await db.commit()

        logger.info(
            f"Deleted job {job_id} ({job.filename}) and {transactions_deleted} transactions"
        )

        return {
            "message": "Job deleted successfully",
            "job_id": job_id,
            "transactions_deleted": transactions_deleted,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting job {job_id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
