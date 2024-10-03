import React, { useEffect, useState } from 'react';
import { useWebSocketData } from './WebSocketContext';

export default function Table() {
    const { tableData}  = useWebSocketData();

    useEffect(() => {

    }, [tableData]);

    return (
        <div className='table-container'>
            <table>
                <thead>
                    <tr>
                        <th>Id Vuelo</th>
                        <th>Aeropuerto Salida</th>
                        <th>Ciudad Salida</th>
                        <th>Aeropuerto Llegada</th>
                        <th>Ciudad Llegada</th>
                        <th>Fecha Salida</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        (tableData || []).map((flight, index) => {
                            return (
                                <tr key={index}>
                                    <td>{flight.id}</td>
                                    <td>{flight.departure.name} ({flight.departure.id})</td>
                                    <td>{flight.departure.city.name} ({flight.departure.city.id})</td>
                                    <td>{flight.destination.name} ({flight.destination.id})</td>
                                    <td>{flight.destination.city.name} ({flight.destination.city.id})</td>
                                    <td>{new Date(flight.departure_date).toLocaleString()}</td>
                                </tr>
                            );
                        })
                    }
                </tbody>
            </table>
        </div>
    );
};