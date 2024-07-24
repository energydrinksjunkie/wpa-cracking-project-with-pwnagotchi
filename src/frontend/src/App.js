import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Handshakes from './components/Handshakes';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import NotFound from './components/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/handshakes" element={<ProtectedRoute>
                                    <Handshakes />
                                    </ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  </BrowserRouter>
  );
}

export default App;
