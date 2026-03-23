from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Any


class CompanyCreate(BaseModel):
    ticker: str
    name: Optional[str] = None
    sector: Optional[str] = None
    exchange: Optional[str] = None
    market_cap: Optional[float] = None
    shares_out: Optional[float] = None
    float_shares: Optional[float] = None
    net_debt: Optional[float] = None
    ev: Optional[float] = None
    notes: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    exchange: Optional[str] = None
    market_cap: Optional[float] = None
    shares_out: Optional[float] = None
    float_shares: Optional[float] = None
    net_debt: Optional[float] = None
    ev: Optional[float] = None
    notes: Optional[str] = None


class DealCreate(BaseModel):
    ticker: str
    stage: str = "Scanned"
    priority: Optional[str] = None
    pod_owner: Optional[str] = None
    next_action: Optional[str] = None


class DealStageUpdate(BaseModel):
    stage: str


class DealOwnerUpdate(BaseModel):
    pod_owner: str


class DealActionUpdate(BaseModel):
    next_action: str


class DealAlertCreate(BaseModel):
    alert: str


class BlueprintCreate(BaseModel):
    anchor: Optional[str] = None
    core_problem: Optional[str] = None
    era_stack: Optional[str] = None
    capital_plan: Optional[str] = None
    key_actions: Optional[str] = None
    timeline: Optional[str] = None


class BlueprintUpdate(BaseModel):
    anchor: Optional[str] = None
    core_problem: Optional[str] = None
    era_stack: Optional[str] = None
    capital_plan: Optional[str] = None
    key_actions: Optional[str] = None
    timeline: Optional[str] = None


class SignalCreate(BaseModel):
    signal_type: str = Field(..., alias="type")
    title: str
    description: Optional[str] = None


class Form25Create(BaseModel):
    ticker: Optional[str] = None
    filing_url: Optional[str] = None
    notes: Optional[str] = None


class Form25Classify(BaseModel):
    classification: str
    notes: Optional[str] = None


class ScoreResponse(BaseModel):
    ticker: str
    eci: Optional[float] = None
    cci: Optional[float] = None
    ets: Optional[float] = None
    ets2: Optional[float] = None
    eis: Optional[float] = None
    eti: Optional[float] = None
    band: Optional[str] = None
    quadrant: Optional[str] = None
    map_x: Optional[float] = None
    map_y: Optional[float] = None
    scored_at: datetime
    details: Optional[Any] = None
