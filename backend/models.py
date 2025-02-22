from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base, engine


class Polygon(Base):
    __tablename__ = "polygons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    coordinates = Column(String)


class PeopleLog(Base):
    __tablename__ = "people_logs"
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, unique=True, index=True)  
    cx = Column(Integer)
    cy = Column(Integer)
    detected_at = Column(DateTime, default=datetime.now)

    entry_exit_logs = relationship("EntryExitLog", back_populates="person")


class EntryExitLog(Base):
    __tablename__ = "entry_exit_logs"
    id = Column(Integer, primary_key=True, index=True)
    track_id = Column(Integer, index=True)
    event = Column(String)
    timestamp = Column(DateTime, default=datetime.now)

    person_id = Column(Integer, ForeignKey("people_logs.id"))

    person = relationship("PeopleLog", back_populates="entry_exit_logs")


Base.metadata.create_all(bind=engine)
