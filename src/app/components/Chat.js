"use client";

import { useState, useEffect } from 'react';

const Chat = ({ apiUrl }) => {
  const [messages, setMessages] = useState([{
      user: "Bot", text: "Hola, soy un chatbot que te ayudará a responder tus preguntas sobre algunas peliculas. Las peliculas que puedo responder son: - Basic Instinct - Catch Me if You Can \n- Dances with Wolves \n- Dead Poets Society \n- Jojo Rabbit \n- Slumdog Millionaire \n- The Godfather \n- The Matrix \n- The Prestige \n- Twelve Monkeys. Puedes hacerme una pregunta sobre alguna de estas peliculas y te responderé lo mejor que pueda."
  }]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const handleSendMessage = async (times_retried) => {
    if (currentMessage.trim() === '') return;

    setIsSending(true);
    const newMessage = { user: 'Me', text: currentMessage };
    setMessages((prev) => [...prev, newMessage]);

    setCurrentMessage('');

    try {
      setMessages((prev) => [...prev, { user: 'Bot', text: 'Typing' }]);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: currentMessage }),
      });

      if (response.ok) {
        if (response.status === 204) {
          console.log('No logré responder, puedes intentarlo nuevamente.');
          setMessages((prev) => [...prev.slice(0, -1), { user: 'Bot', text: 'No logré responder, puedes intentarlo nuevamente.' }]);
        } else {
          const reader = response.body.getReader();
          let receivedText = '';
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedText += decoder.decode(value, { stream: true });
            setMessages((prev) => [...prev.slice(0, -1), { user: 'Bot', text: receivedText }]);
          }
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev.slice(0, -2)]);
      if (newMessage.text.length > 100) {
        alert('Ha ocurrido un error, se intentará de nuevo con un mensaje más chico.');
        setCurrentMessage(newMessage.text.slice(0, 100));
        await handleSendMessage();
      } else if (times_retried < 3) {
        alert('Ha ocurrido un error, intentando enviar nuevamente.');
        await handleSendMessage(times_retried + 1);
      } else {
        alert('Ha ocurrido un error, se dejó de intentar.');
      }
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col h-[70vh] min-w-[70vw] bg-gray-100 p-6 w-4/5 mx-auto">
      <div className="flex-grow overflow-y-auto p-4 bg-white shadow-md rounded-lg">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex my-2 ${
              msg.user === 'Me' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`p-2 rounded-md max-w-[70%] ${
                msg.user === 'Me' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              <strong>{msg.user}:</strong> {msg.text}
              {isSending && index === messages.length - 1 && (
                <span className="dots"></span>
              )}
            </div>
          </div>
        ))}
      </div>
      {isClient ? (
        <div className="mt-4 flex items-center gap-2">
          <textarea
            className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm resize-none focus:outline-none focus:ring focus:ring-black text-black"
            rows="2"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            disabled={isSending}
          />
          <button
            onClick={() => handleSendMessage(0)}
            disabled={isSending}
            className={`px-4 py-2 rounded-md text-white ${
              isSending ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            Send
          </button>
        </div>
      ) : (
        <div>
          <p> Porfavor recargar la página </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
