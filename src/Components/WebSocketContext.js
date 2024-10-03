// WebSocketContext.jsx
import React, { createContext, useEffect, useState, useContext, useRef } from 'react';

const WebSocketContext = createContext();

export function WebSocketProvider({ children }) {
  const [new_data, setNewData] = useState(null);
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
  // Nombres de los aeropuertos asociados a un vuelo
  const [tableData, setTableData] = useState([]);
  const [crashes, setCrashes] = useState([])
  const [takeoffs, setTakeoffs] = useState([])
  const [landings, setLandings] = useState([])
  const [alert, setAlert] = useState("");
  const timeoutRef = useRef()
  const socketRef = useRef(null);


  const handleMessage = (new_data) => {
    setMessages(prevMessages => [...prevMessages, new_data]);
  }

  const handleFlights = (new_data) => {
    const tempArrivalAirports = new Set();
    const tempDepartureAirports = new Set();
    const tempFlights = new Set();
    const tempTableData = [];
    const flightsData = new_data.flights;
    Object.keys(flightsData).forEach((flight) => {
      tempArrivalAirports.add(flightsData[flight].departure);
      if (!(flightsData[flight].destination in tempArrivalAirports)) {
        tempDepartureAirports.add(flightsData[flight].destination);
      }
      tempFlights.add([[flightsData[flight].departure.location.lat, flightsData[flight].departure.location.long], [flightsData[flight].destination.location.lat, flightsData[flight].destination.location.long]]);
      tempTableData.push(flightsData[flight]);
    });

    tempTableData.sort((a, b) => ((flightsData[a].departure.name > flightsData[b].departure.name) || ((flightsData[a].departure.name === flightsData[b].departure.name) && (flightsData[a].destination.name > flightsData[b].destination.name))) ? 1 : -1);
    setTableData(() => Array.from(tempTableData));
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

  const resetTimeout = (socketRef, timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setAlert("No se ha recibido mensajes en 5 segundos, asegúrate de que nadie más esté conectado a la página")	;
      setAlert("Intentando reconectar")	;
      socketRef.current.close();
      initializeWebSocket(socketRef, timeoutRef);
    }, 5000);
  }  
  const initializeWebSocket = (socketRef, timeoutRef) => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    socketRef.current = new WebSocket('wss://tarea-2.2024-2.tallerdeintegracion.cl/connect');
    resetTimeout(socketRef, timeoutRef)
    socketRef.current.onmessage = (event) => {
      setAlert("")
      const data_received = JSON.parse(event.data);
      setNewData(data_received);
      resetTimeout(socketRef, timeoutRef);
      const data_type = data_received.type;
      if (data_type === 'message') {
        handleMessage(data_received);
      }
      if (data_type === 'flights') {
        handleFlights(data_received);
      }
      if (data_type === 'plane') {
        handlePlanes(data_received);
      }
      if (data_type === 'crashed') {
        handleCrash(data_received);
      }
      if (data_type === 'take-off') {
        handleTakeoff(data_received);
      }
      if (data_type === 'landing') {
        handleLandings(data_received);
      };
    };

    socketRef.current.onclose = (event) => {          
    };

    socketRef.current.onerror = (error) => {
      setAlert("Error en la conexión con Websocket")
    };

    socketRef.current.onopen = () => {
      socketRef.current.send(JSON.stringify({ type: 'join', id: '19638094', username: 'MartinRSTS' }));
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    resetTimeout(socketRef, timeoutRef);
  }
  
  useEffect(() => {
    initializeWebSocket(socketRef, timeoutRef);
  }, []); 



  function sendMessage(message) {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'chat', content: message }));
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
      alert,
      tableData
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketData() {
  return useContext(WebSocketContext);
}