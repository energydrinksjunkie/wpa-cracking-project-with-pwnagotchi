import './App.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Handshakes from './components/Handshakes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/handshakes" element={<Handshakes />} />
        <Route path="*" element={<h1>Not Found</h1>} />
      </Routes>
  </BrowserRouter>
  );
}

export default App;
