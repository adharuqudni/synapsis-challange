from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class PolygonCreate(BaseModel):
    name: str
    coordinates: List[List[int]]


class PeopleLogBase(BaseModel):
    track_id: int
    cx: int
    cy: int
    detected_at: datetime = Field(default_factory=datetime.utcnow)


class PeopleLogCreate(PeopleLogBase):
    pass


class PeopleLogResponse(PeopleLogBase):
    id: int

    class Config:
        from_attributes = True


class EntryExitLogBase(BaseModel):
    track_id: int
    event: str  
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class EntryExitLogCreate(EntryExitLogBase):
    pass


class EntryExitLogResponse(EntryExitLogBase):
    id: int
    person: Optional[PeopleLogResponse]  

    class Config:
        from_attributes = True
