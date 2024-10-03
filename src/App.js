import logo from './logo.svg';
import './App.css';
import { WebSocketProvider } from './Components/WebSocketContext';
import Chat from './Components/Chat';
import Map from './Components/Map';
import Table from './Components/Table';
function App() {
  return (
    <WebSocketProvider>
      <div className="App">
        <div className="upperPart">
          <div className='column'>
              <Map />
            </div>
          <div className='column'>
            <Chat /> 
          </div>
          </div>
        <Table />
      </div>  
    </WebSocketProvider>
  );
}

export default App;
