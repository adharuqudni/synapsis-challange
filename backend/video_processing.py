import asyncio
import base64
import json
import cv2
import torch
from ultralytics import YOLO
import numpy as np
from collections import defaultdict
from database import SessionLocal
from models import PeopleLog, EntryExitLog, Polygon
from websocket_manager import ws_manager

PERSON_CLASS_ID = 0
FRAME_DELAY = 0.01


def is_inside_polygon(point, polygon):
    return cv2.pointPolygonTest(polygon, point, False) >= 0


def box_intersects_polygon(box, polygon):

    x, y, w, h = box

    box_contour = np.array(
        [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], dtype=np.int32
    )

    polygon_contour = np.array(polygon, dtype=np.int32)

    intersection, _ = cv2.intersectConvexConvex(box_contour, polygon_contour)

    return intersection > 0


def get_active_polygon():
    session = SessionLocal()
    try:
        polygon_record = session.query(Polygon).order_by(Polygon.id.desc()).first()

        if polygon_record:
            return np.array(eval(polygon_record.coordinates), dtype=np.int32).reshape(
                (-1, 1, 2)
            )

        
        default_polygon = [[800, 300], [1200, 300], [1200, 600], [800, 600]]
        polygon_record = Polygon(name="default", coordinates=str(default_polygon))
        session.add(polygon_record)
        session.commit()

        return np.array(default_polygon, dtype=np.int32).reshape((-1, 1, 2))

    except Exception as e:
        print(f"⚠️ Error getting polygon: {e}")
        session.rollback()
        return None

    finally:
        session.close()


async def process_video(m3u8_url, model):
    cap = cv2.VideoCapture(m3u8_url)
    track_history = defaultdict(list)
    track_status = {}
    people_in, people_out = 0, 0

    cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)

    session = SessionLocal()

    try:
        while cap.isOpened():
            people_inside = set()
            people_outside = set()

            success, frame = await asyncio.to_thread(cap.read)
            if not success:
                await asyncio.sleep(FRAME_DELAY)
                continue

            polygon = get_active_polygon()
            if polygon is None:
                print("⚠️ No polygon data, skipping frame.")
                continue

            results = await asyncio.to_thread(model.track, frame, persist=True)
            if results[0].boxes is None:
                continue

            boxes = results[0].boxes.xywh.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            class_ids = results[0].boxes.cls.int().cpu().tolist()

            cv2.polylines(
                frame, [polygon], isClosed=True, color=(0, 255, 0), thickness=2
            )

            for box, track_id, class_id in zip(boxes, track_ids, class_ids):
                if class_id != PERSON_CLASS_ID:
                    continue

                x, y, w, h = box
                cx, cy = int(x + w / 2), int(y + h)

                track_history[track_id].append((cx, cy))
                if len(track_history[track_id]) > 10:
                    track_history[track_id].pop(0)

                inside_now = box_intersects_polygon(box, polygon)
                was_inside = track_status.get(track_id, None)

                person_log = (
                    session.query(PeopleLog).filter_by(track_id=track_id).first()
                )

                if person_log:

                    person_log.cx = cx
                    person_log.cy = cy
                else:

                    person_log = PeopleLog(track_id=track_id, cx=cx, cy=cy)
                    session.add(person_log)
                    session.flush()

                if inside_now:
                    people_inside.add(track_id)
                else:
                    people_outside.add(track_id)

                if was_inside is None:
                    track_status[track_id] = inside_now

                else:
                    if was_inside is False and inside_now is True:
                        people_in += 1
                        session.add(
                            EntryExitLog(
                                track_id=track_id,
                                event="enter",
                                person_id=person_log.id,
                            )
                        )

                    elif was_inside is True and inside_now is False:
                        people_out += 1
                        session.add(
                            EntryExitLog(
                                track_id=track_id, event="exit", person_id=person_log.id
                            )
                        )

                    track_status[track_id] = inside_now

                x1, y1, x2, y2 = (
                    int(x - w / 2),
                    int(y - h / 2),
                    int(x + w / 2),
                    int(y + h / 2),
                )

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
                cv2.putText(
                    frame,
                    f"ID {track_id}",
                    (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (0, 255, 255),
                    2,
                )

                if len(track_history[track_id]) > 1:
                    points = np.array(track_history[track_id], dtype=np.int32).reshape(
                        (-1, 1, 2)
                    )
                    cv2.polylines(
                        frame,
                        [points],
                        isClosed=False,
                        color=(230, 230, 230),
                        thickness=2,
                    )

            cv2.putText(
                frame,
                f"People In: {people_in}",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )
            cv2.putText(
                frame,
                f"People Out: {people_out}",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 0, 255),
                2,
            )

            cv2.putText(
                frame,
                f"Currently Inside: {len(people_inside)}",
                (20, 110),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 0, 0),
                2,
            )
            cv2.putText(
                frame,
                f"Currently Outside: {len(people_outside)}",
                (20, 140),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 0),
                2,
            )

            session.commit()

            _, buffer = cv2.imencode(".jpg", frame)
            [frame_height, frame_width, _] = frame.shape
            frame_base64 = base64.b64encode(buffer).decode()
            data_ws = {
                "frame": frame_base64,
                "meta_data": {
                    "people_in": people_in,
                    "people_out": people_out,
                    "currently_inside": len(people_inside),
                    "currently_outside": len(people_outside),
                    "frame_width": frame_width,
                    "frame_height": frame_height,
                },
            }
            data_string = json.dumps(data_ws)

            await ws_manager.broadcast(data_string)

    except Exception as e:
        print(f"❌ Error in process_video: {e}")

    finally:
        print("Releasing resources...")
        cap.release()
        session.close()
