import React from 'react';

export default function MessageReceived({ message }) {

    const formattedDate = new Date(message.date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    return (
        <div className="message-container">
            {message.level === 'warn' ?
            <p className='message-received-warn'>{message.name}: {message.content}</p>:
            <p className='message-received'>{message.name}: {message.content}</p>
            }
            <p className='date-information-received'>{formattedDate}</p>
        </div>
    );
};