from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Float, Integer, DateTime, Text, Boolean


class Base(DeclarativeBase):
    pass


class Company(Base):
    __tablename__ = "companies"

    ticker: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sector: Mapped[str | None] = mapped_column(String(255), nullable=True)
    exchange: Mapped[str | None] = mapped_column(String(50), nullable=True)
    market_cap: Mapped[float | None] = mapped_column(Float, nullable=True)
    shares_out: Mapped[float | None] = mapped_column(Float, nullable=True)
    float_shares: Mapped[float | None] = mapped_column(Float, nullable=True)
    net_debt: Mapped[float | None] = mapped_column(Float, nullable=True)
    ev: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class LensScore(Base):
    __tablename__ = "lens_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(20), index=True)

    eci: Mapped[float | None] = mapped_column(Float, nullable=True)
    eds: Mapped[float | None] = mapped_column(Float, nullable=True)
    csis: Mapped[float | None] = mapped_column(Float, nullable=True)
    giis: Mapped[float | None] = mapped_column(Float, nullable=True)
    lpss: Mapped[float | None] = mapped_column(Float, nullable=True)
    res: Mapped[float | None] = mapped_column(Float, nullable=True)

    cci: Mapped[float | None] = mapped_column(Float, nullable=True)
    ccs: Mapped[float | None] = mapped_column(Float, nullable=True)
    fds: Mapped[float | None] = mapped_column(Float, nullable=True)
    eei: Mapped[float | None] = mapped_column(Float, nullable=True)
    nds: Mapped[float | None] = mapped_column(Float, nullable=True)

    ets: Mapped[float | None] = mapped_column(Float, nullable=True)
    ets2: Mapped[float | None] = mapped_column(Float, nullable=True)
    eis: Mapped[float | None] = mapped_column(Float, nullable=True)
    eti: Mapped[float | None] = mapped_column(Float, nullable=True)

    band: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quadrant: Mapped[str | None] = mapped_column(String(100), nullable=True)
    map_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    map_y: Mapped[float | None] = mapped_column(Float, nullable=True)

    payload_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    scored_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Deal(Base):
    __tablename__ = "deals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    stage: Mapped[str] = mapped_column(String(50), default="Scanned")
    priority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    pod_owner: Mapped[str | None] = mapped_column(String(255), nullable=True)
    next_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    alert_flags: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Blueprint(Base):
    __tablename__ = "era_blueprints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(20), index=True)
    anchor: Mapped[str | None] = mapped_column(Text, nullable=True)
    core_problem: Mapped[str | None] = mapped_column(Text, nullable=True)
    era_stack: Mapped[str | None] = mapped_column(Text, nullable=True)
    capital_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    key_actions: Mapped[str | None] = mapped_column(Text, nullable=True)
    timeline: Mapped[str | None] = mapped_column(Text, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Signal(Base):
    __tablename__ = "signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(20), index=True)
    signal_type: Mapped[str] = mapped_column(String(100), index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Form25Queue(Base):
    __tablename__ = "form25_queue"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str | None] = mapped_column(String(20), nullable=True)
    filing_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    classification: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
class ERERReport(Base):
    __tablename__ = "erer_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    ticker: Mapped[str] = mapped_column(String(20), index=True)
    anchor: Mapped[float] = mapped_column(Float)
    horizon: Mapped[int] = mapped_column(Integer)
    current_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    shares_outstanding: Mapped[float | None] = mapped_column(Float, nullable=True)
    unlock_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    priority: Mapped[str | None] = mapped_column(String(50), nullable=True)
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
