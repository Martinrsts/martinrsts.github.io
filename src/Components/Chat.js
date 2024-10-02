import React, { useState } from 'react';
import MessageReceived from './MessageReceived';
import MessageSent from './MessageSent';
import { useWebSocketData } from './WebSocketContext';

export default function Chat() {

    const { messages, sendMessage, alert } = useWebSocketData();
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSendMessage = () => {
        if (inputValue) {
            sendMessage(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className='chat'>
            {alert ? <div className='alert'>{alert}</div> : 
            <div className='messages'>
                {(messages || []).map((message, index) => {
                    if (message.message.name === 'MartinRSTS') {
                        return <MessageSent key={index} message={message.message} />;
                    } else {
                        return <MessageReceived key={index} message={message.message} />;
                    }
                })}
            </div>
            }
            <input type="text" value={inputValue} onChange={handleInputChange} />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};