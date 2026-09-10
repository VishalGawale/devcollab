import { useEffect, useRef, useState, useCallback } from 'react';
import { WEBSOCKET_URL } from '../config';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  timestamp?: string;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const WS_URL = `${WEBSOCKET_URL}/ws/updates`;
    
    console.log('Connecting to WebSocket:', WS_URL);
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 WebSocket message:', message);
        setLastMessage(message);
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    ws.current.onclose = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      console.log('Cleaning up WebSocket');
      ws.current?.close();
    };
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
