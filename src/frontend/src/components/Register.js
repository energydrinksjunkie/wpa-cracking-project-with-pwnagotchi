import './Register.css';
import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const api_url = 'http://localhost:3000/auth/register';

  const handleRegister = async () => {
    try {
      await axios.post(api_url, { username, password });
      window.location.href = '/login';
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  return (
    <>
      <div className="register">
        <h2>Register</h2>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={handleRegister}>Register</button>
        <p className="click-here" onClick={() => window.location.href = '/login'}>Already have an account?</p>
      </div>
    </>
  );
}

export default Register;
