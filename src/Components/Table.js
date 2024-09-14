import React, { useState } from 'react';
import { useWebSocketData } from './WebSocketContext';

export default function Table() {
    const data = useWebSocketData();
    return (
        <div className='table'>
        </div>
    );
};