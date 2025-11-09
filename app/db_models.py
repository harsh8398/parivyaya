"""Database models for job tracking and transaction storage"""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, Float, String, Text, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all database models"""

    pass


class JobStatus(str, PyEnum):
    """Job processing status"""

    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class Job(Base):
    """Job tracking table for PDF processing tasks"""

    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[JobStatus] = mapped_column(
        Enum(JobStatus, native_enum=False), nullable=False, default=JobStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    transaction_count: Mapped[int | None] = mapped_column(nullable=True)

    def __repr__(self):
        return f"<Job(id={self.id}, filename={self.filename}, status={self.status})>"


class TransactionDB(Base):
    """Transaction storage table"""

    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    job_id: Mapped[str] = mapped_column(
        String(36), nullable=False, index=True
    )  # FK to Job
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    category_primary: Mapped[str] = mapped_column(String(50), nullable=False)
    category_detailed: Mapped[str] = mapped_column(String(100), nullable=False)
    category_confidence_level: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self):
        return f"<Transaction(id={self.id}, job_id={self.job_id}, title={self.title}, amount={self.amount})>"
