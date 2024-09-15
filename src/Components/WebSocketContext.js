// WebSocketContext.jsx
import React, { createContext, useEffect, useState, useContext, useRef } from 'react';

const WebSocketContext = createContext();
let socket; // Declare WebSocket at a module level to maintain its state globally

export function WebSocketProvider({ children }) {
  const [data, setData] = useState([]);
  const [messages, setMessages] = useState([]);
  const [flights, setFlights] = useState([]);
  const [arrivalAirports, setArrivalAirports] = useState([]);
  const [departureAirports, setDepartureAirports] = useState([]);
  const [planes, setPlanes] = useState({});
  const [flightsId, setFlightsId] = useState([])
  const [initialPositions, setInitialPositions] = useState({})
  const isSocketInitialized = useRef(false); // To ensure the socket is only initialized once

  useEffect(() => {
    // Only initialize the WebSocket once
    if (!isSocketInitialized.current) {
      socket = new WebSocket('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
      isSocketInitialized.current = true;
      console.log('WebSocket initialized');

      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setData(prevData => [...prevData, data]);
        const data_type = data.type;
        if (data_type === 'message') {
          setMessages(prevMessages => [...prevMessages, data]);
          console.log('Message received:', data);
        }
        if (data_type === 'flights') {
          const tempArrivalAirports = new Set();
          const tempDepartureAirports = new Set();
          const tempFlights = new Set();
          const flightsData = data.flights;
          Object.keys(flightsData).forEach((flight) => {
            tempArrivalAirports.add(flightsData[flight].departure);
            if (!(flightsData[flight].destination in tempArrivalAirports)) {
              tempDepartureAirports.add(flightsData[flight].destination);
            }
            tempFlights.add([[flightsData[flight].departure.location.lat, flightsData[flight].departure.location.long], [flightsData[flight].destination.location.lat, flightsData[flight].destination.location.long]]);
          });
          setArrivalAirports(Array.from(tempArrivalAirports));
          setDepartureAirports(Array.from(tempDepartureAirports));
          setFlights(Array.from(tempFlights));
        }
        if (data_type == 'plane') {
          const flightId = data.plane.flight_id;

          // Update flightsId and initialPositions if necessary
          setFlightsId(prevFlightsId => {
            if (!prevFlightsId.includes(flightId)) {
              setInitialPositions(prevInitialPositions => {
                if (!(flightId in prevInitialPositions)) {
                  return {
                    ...prevInitialPositions,
                    [flightId]: data.plane.position
                  };
                }
                return prevInitialPositions;
              });
              return [...prevFlightsId, flightId];
            }
            return prevFlightsId;
          });

          setPlanes(prevPlanes => ({
            ...prevPlanes,
            [flightId]: data.plane
          }));
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
    <WebSocketContext.Provider value={{
      messages,
      sendMessage,
      arrivalAirports,
      departureAirports,
      flights,
      planes,
      flightsId,
      initialPositions
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketData() {
  return useContext(WebSocketContext);
}