import os


os.environ["YOLO_VERBOSE"] = "False"

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, Depends
import asyncio
from websocket_manager import ws_manager
from video_processing import process_video
from ultralytics import YOLO, settings
import numpy as np
from database import SessionLocal
from models import EntryExitLog, Polygon
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload


@asynccontextmanager
async def lifespan(app: FastAPI):

    task = asyncio.create_task(process_video(M3U8_URL, model))
    yield
    task.cancel()
    print("App is exited")


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolo11n.pt", verbose=False)
M3U8_URL = "https://cctvjss.jogjakota.go.id/malioboro/Malioboro_2_Depan_Toko_Subur.stream/playlist.m3u8"


@app.get("/api/stats/")
def get_stats(page: int = 1, limit: int = 10, start_date: str = None, end_date: str = None):
    session = SessionLocal()

    query = session.query(EntryExitLog).options(joinedload(EntryExitLog.person))

    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(EntryExitLog.timestamp >= start_dt)

    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(EntryExitLog.timestamp <= end_dt)

    total_count = query.count()
    offset = (page - 1) * limit

    logs = query.offset(offset).limit(limit).all()

    session.close()

    return {
        "data": [
            {
                "id": log.id,
                "track_id": log.track_id,
                "event": log.event,
                "timestamp": log.timestamp,
                "person": (
                    {
                        "id": log.person.id if log.person else None,
                        "cx": log.person.cx if log.person else None,
                        "cy": log.person.cy if log.person else None,
                        "detected_at": log.person.detected_at if log.person else None,
                    }
                    if log.person
                    else None
                ),
            }
            for log in logs
        ],
        "count": total_count,
        "current_page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit,
    }

@app.get("/api/health/")
def get_stats():
    return "Health is good"


@app.get("/api/stats/live")
def get_live_stats():
    session = SessionLocal()
    five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)

    latest_logs = (
        session.query(EntryExitLog)
        .filter(EntryExitLog.timestamp >= five_minutes_ago)
        .options(joinedload(EntryExitLog.person))
        .order_by(EntryExitLog.timestamp.desc())
        .all()
    )
    session.close()

    return [
        {
            "id": log.id,
            "track_id": log.track_id,
            "event": log.event,
            "timestamp": log.timestamp,
            "person": (
                {
                    "id": log.person.id if log.person else None,
                    "cx": log.person.cx if log.person else None,
                    "cy": log.person.cy if log.person else None,
                    "detected_at": log.person.detected_at if log.person else None,
                }
                if log.person
                else None
            ),
        }
        for log in latest_logs
    ]


@app.get("/api/config/area/latest")
def get_latest_polygon():
    session = SessionLocal()
    polygon = session.query(Polygon).order_by(Polygon.id.desc()).first()
    session.close()
    if polygon:
        return {
            "id": polygon.id,
            "name": polygon.name,
            "coordinates": polygon.coordinates,
        }
    return {"message": "No active polygon found"}


class PolygonUpdate(BaseModel):
    coordinates: List[List[int]]


@app.post("/api/config/area")
def update_polygon(config: PolygonUpdate):
    session = SessionLocal()
    polygon = session.query(Polygon).first()
    if not polygon:
        polygon = Polygon(name="default", coordinates=str(config.coordinates))
        session.add(polygon)
    else:
        polygon.coordinates = str(config.coordinates)
    session.commit()
    session.close()
    return {"message": "Polygon updated successfully"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        await ws_manager.disconnect(websocket)
