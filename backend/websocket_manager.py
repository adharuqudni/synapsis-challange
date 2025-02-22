from fastapi import WebSocket
import asyncio

class WebSocketManager:
    def __init__(self):
        self.active_connections = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for websocket in list(self.active_connections):
            try:
                await websocket.send_text(message)
            except:
                self.active_connections.remove(websocket)

ws_manager = WebSocketManager()