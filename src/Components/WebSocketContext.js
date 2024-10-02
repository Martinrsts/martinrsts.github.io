// WebSocketContext.jsx
import React, { createContext, useEffect, useState, useContext, useRef } from 'react';

const WebSocketContext = createContext();
let socket; // Declare WebSocket at a module level to maintain its state globally

export function WebSocketProvider({ children }) {
  // Chat Messages
  const [messages, setMessages] = useState([]);
  // Array de posiciones de vuelos [[lat1, long1], [lat2, long2]]
  const [flights, setFlights] = useState([]);
  // Array de aeropuertos de llegada
  const [arrivalAirports, setArrivalAirports] = useState([]);
  // Array de aeropuertos de salida
  const [departureAirports, setDepartureAirports] = useState([]);

  // Lista de aviones (asociado a un id de vuelo)
  const [planes, setPlanes] = useState({});

  // Todos los id de vuelos que han sido recibidos
  const [flightsId, setFlightsId] = useState([])

  // Todos las posiciones iniciales obtenidas en planes.
  const [initialPositions, setInitialPositions] = useState({})
  const [crashes, setCrashes] = useState([])
  const [takeoffs, setTakeoffs] = useState([])
  const [landings, setLandings] = useState([])
  const [alert, setAlert] = useState("");
  const isSocketInitialized = useRef(false); // To ensure the socket is only initialized once

  useEffect(() => {
    // Only initialize the WebSocket once
    if (!isSocketInitialized.current) {
      socket = new WebSocket('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
      isSocketInitialized.current = true;
      console.log('WebSocket initialized');
      setAlert("")

      const handleMessage = (new_data) => {
        setMessages(prevMessages => [...prevMessages, new_data]);
      }

      const handleFlights = (new_data) => {
        const tempArrivalAirports = new Set();
        const tempDepartureAirports = new Set();
        const tempFlights = new Set();
        const flightsData = new_data.flights;
        Object.keys(flightsData).forEach((flight) => {
          tempArrivalAirports.add(flightsData[flight].departure);
          if (!(flightsData[flight].destination in tempArrivalAirports)) {
            tempDepartureAirports.add(flightsData[flight].destination);
          }
          tempFlights.add([[flightsData[flight].departure.location.lat, flightsData[flight].departure.location.long], [flightsData[flight].destination.location.lat, flightsData[flight].destination.location.long]]);
        });
        setArrivalAirports(() => Array.from(tempArrivalAirports));
        setDepartureAirports(() => Array.from(tempDepartureAirports));
        setFlights(() => Array.from(tempFlights));
        setPlanes(prevPlanes => {
          const updatedPlanes = {};
          Object.keys(prevPlanes).forEach(key => {
            if (flightsData[key]) {
              updatedPlanes[key] = prevPlanes[key];
            }
          });
          return updatedPlanes;
        })

        setInitialPositions(prevInitialPositions => {
          const updatedInitialPositions = {};
          Object.keys(prevInitialPositions).forEach(key => {
            if (flightsData[key]) {
              updatedInitialPositions[key] = prevInitialPositions[key];
            }
          });
          return updatedInitialPositions;
        });
        setFlightsId((prevFlightsId) =>prevFlightsId.filter((flightId) => flightId in flightsData))
          
      }
      
      const handlePlanes = (new_data) => {
        const flightId = new_data.plane.flight_id;
        setFlightsId(prevFlightsId => {
          if (!prevFlightsId.includes(flightId)) {
            return [...prevFlightsId, flightId];
          }
          return prevFlightsId;
        });
        setInitialPositions(prevInitialPositions => {
          if (!(flightId in prevInitialPositions)) {
            return {
              ...prevInitialPositions,
              [flightId]: new_data.plane.position
            };
          }
          return prevInitialPositions;
        });
        setPlanes(prevPlanes => {
          return ({
          ...prevPlanes,
          [flightId]: new_data.plane
        })});
      }

      const handleTakeoff = (new_data) => {
        setPlanes(prevPlanes => {
          if (prevPlanes[new_data.flight_id]) {
            const takeoffPlane = prevPlanes[new_data.flight_id];
            takeoffPlane.flight_id = new_data.flight_id;
            setTakeoffs(prevTakeoffs => [...prevTakeoffs, takeoffPlane]);
          }
          return prevPlanes;
        })
        setTimeout(() => {
          setTakeoffs(prevTakeoffs => {
            const updatedTakeoffs = [...prevTakeoffs];
            return updatedTakeoffs.filter(takeoff => takeoff.flight_id !== new_data.flight_id)
          });
        }, 60000);
      }

      const handleCrash = (new_data) => {
        setPlanes(prevPlanes => {
          if (prevPlanes[new_data.flight_id]) {
            const crashedPlane = prevPlanes[new_data.flight_id];
            crashedPlane.flight_id = new_data.flight_id;
            setCrashes(prevCrashed => [...prevCrashed, crashedPlane]);
          }
          return prevPlanes;
        });
        setTimeout(() => {
          setCrashes(prevCrashes => {
            const updatedCrashes = [...prevCrashes];
            return updatedCrashes.filter(crashed => crashed.flight_id !== new_data.flight_id)
          });
        }, 60000);
      }

      const handleLandings = (new_data) => {
        setPlanes(prevPlanes => {
          if (prevPlanes[new_data.flight_id]) {
            const landingPlane = prevPlanes[new_data.flight_id];
            landingPlane.flight_id = new_data.flight_id;
            setLandings(prevLandings => [...prevLandings, landingPlane]);
          }
          return prevPlanes;
        });
        setTimeout(() => {
          setLandings(prevLandings => {
            const updatedLandings = [...prevLandings];
            return updatedLandings.filter(landing => landing.flight_id !== new_data.flight_id)
          });
        }, 60000);
      }


      
      socket.onmessage = (event) => {
        const new_data = JSON.parse(event.data);
        const data_type = new_data.type;
        if (data_type === 'message') {
          handleMessage(new_data);
        }
        if (data_type === 'flights') {
          handleFlights(new_data);
        }
        if (data_type === 'plane') {
          handlePlanes(new_data);
        }
        if (data_type === 'crashed') {
          handleCrash(new_data);
        }
        if (data_type === 'take-off') {
          handleTakeoff(new_data);
        }
        if (data_type === 'landing') {
          handleLandings(new_data);
        };
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event);
        console.log(messages);
        console.log(flights);
        console.log(planes);
        console.log(flightsId);
        console.log(initialPositions);
        console.log(crashes);
        console.log(takeoffs);
        console.log(landings);
        console.log(alert);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onopen = () => {
        console.log('WebSocket connected');
        socket.send(JSON.stringify({ type: 'join', id: '19638094', username: 'MartinRSTS' }));
      }
    }
  }, []); // Runs once on the initial mount

  function sendMessage(message) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'chat', content: message }));
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
      initialPositions,
      crashes,
      takeoffs,
      landings,
      alert
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketData() {
  return useContext(WebSocketContext);
}