import React from 'react';

export default function MessageSent({ message }) {

    const formattedDate = new Date(message.date).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    return (
        <div className="message-container">
            <p className='message-sent'>{message.name}: {message.content}</p>
            <p className='date-information-sent'>{formattedDate}</p>
        </div>
    );
};