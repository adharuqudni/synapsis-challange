import { useEffect, useState } from 'react';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8000/ws';

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectAttempts = 0;

    const connectWebSocket = () => {
      ws = new WebSocket(SOCKET_URL);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        console.log('Received:', event.data);
        setMessages((prev) => [...prev, event.data]);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setSocket(null);

        if (reconnectAttempts < 5) {
          const timeout = Math.min(1000 * 2 ** reconnectAttempts, 30000);
          reconnectAttempts++;
          console.log(`Reconnecting in ${timeout / 1000} seconds...`);
          setTimeout(connectWebSocket, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      ws.close();
    };
  }, []);

  return { socket, isConnected, messages };
}
