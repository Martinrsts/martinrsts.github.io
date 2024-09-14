// src/MapView.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import airportIconDepartureImage from '../assets/airportIconDeparture.png';
import airportIconArrivalImage from '../assets/airportIconArrival.png';
import { useWebSocketData } from './WebSocketContext';

export default function Map() {
  const position = [-33.45694, -70.64827]; 
  const { arrivalAirports, departureAirports, flights } = useWebSocketData();

  const airportIconDeparture = new L.Icon({
    iconUrl: airportIconDepartureImage,
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });

  const airportIconArrival = new L.Icon({
    iconUrl: airportIconArrivalImage,
    iconSize: [32, 32], 
    iconAnchor: [16, 32], 
    popupAnchor: [0, -32] 
  });

  return (
    <MapContainer center={position} zoom={2} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {(arrivalAirports || []).map((airport, index) => (
        <Marker key={index} position={[airport.location.lat, airport.location.long]} icon={airportIconArrival}>
          <Popup>
            <p>{airport.id}</p>
            <p>{airport.name}</p>
            <p>{airport.city.name}</p>
            <p>{airport.city.country.name}</p>
          </Popup>
        </Marker>
      ))}
      {(departureAirports || []).map((airport, index) => (
        <Marker key={index} position={[airport.location.lat, airport.location.long]} icon={airportIconDeparture}>
          <Popup>
            {airport.name}
          </Popup>
        </Marker>
      ))}
      {(flights || []).map((flight, index) => (
        <Polyline key={index} positions={flight} color="black"/>
      ))}
    </MapContainer>
  );
};
