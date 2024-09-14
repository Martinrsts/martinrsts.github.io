// WebSocketContext.jsx
import React, { createContext, useEffect, useState, useContext, useRef } from 'react';

const WebSocketContext = createContext();
let socket; // Declare WebSocket at a module level to maintain its state globally

export function WebSocketProvider({ children }) {
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([]);
  const isSocketInitialized = useRef(false); // To ensure the socket is only initialized once

  useEffect(() => {
    // Only initialize the WebSocket once
    if (!isSocketInitialized.current) {
      socket = new WebSocket('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
      isSocketInitialized.current = true;
      console.log('WebSocket initialized');

      
      socket.onmessage = (event) => {
        setData(prevData => [...prevData, JSON.parse(event.data)]);
        if (JSON.parse(event.data).type === 'message') {
          setMessages(prevMessages => [...prevMessages, JSON.parse(event.data)]);
          console.log('Message received:', JSON.parse(event.data));
        }
      };

      socket.onclose = () => {
        console.log('WebSocket closed'); // Handle closure if needed
        // Optional: Add logic to reconnect if needed
        console.log("Reconnecting...");
        socket = new WebSocket('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onopen = () => {
        console.log('WebSocket connected');
        socket.send(JSON.stringify({ type: 'join', id: '19638094', username: 'MartinRSTS' }));
      }
    }

    // Cleanup function will only close the WebSocket if the user leaves the app entirely
    const handleBeforeUnload = () => {
      if (socket) {
        socket.close();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Runs once on the initial mount

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat', content: message }));
      console.log('Message sent:', message);
    } else {
      console.warn('WebSocket is not open. Message not sent:', message);
    }
  };
  

  return (
    <WebSocketContext.Provider value={{data, messages, sendMessage}}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketData() {
  return useContext(WebSocketContext);
}