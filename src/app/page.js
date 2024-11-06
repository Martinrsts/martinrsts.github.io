import Chat from './components/Chat';

export default function Home() {
  const apiUrl = 'https://tareataller.zapto.org/question'; // Replace with your API endpoint

  return (
    <div className="h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">Chat Interface</h1>
          <Chat apiUrl={apiUrl} />
      </div>
    </div>
  );
}
