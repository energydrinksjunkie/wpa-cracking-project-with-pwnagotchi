import './Register.css';
import React, { useState } from 'react';
import axios from 'axios';
import xImg from '../assets/x.png';
import minImg from '../assets/min.png';
import maxImg from '../assets/max.png';
const { REACT_APP_BACKEND_URL } = process.env;

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const api_url = REACT_APP_BACKEND_URL+'/auth/register';

  const handleRegister = async () => {
    try {
      await axios.post(api_url, { username, password });
      setError('Registered successfully! Redirecting to login page...');
      setTimeout(() => {  window.location.href = '/login';}, 2000);     
    } catch (error) {
      setError(error.response.data.error);
            setTimeout(() => {
                setError('');
            }, 2000);
      console.error('Register error:', error);
    }
  };

  return (
    <>
            <div className="window shadow shadowPlus4">
                <div className="window-header">
                    <p className="title">Register</p>
                    <div className="middle"></div>
                    <div className="buttons">
                        <img src={minImg} alt="minimize" className="button" />
                        <img src={maxImg} alt="maximize" className="button" />
                        <img src={xImg} alt="close" className="button exit" onClick={() => window.location.href = '/'} />
                        </div>
                </div>
                <div className="window-body">
                <div className="login-form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={handleRegister}>Register</button>
                <p className='error-register'>{error}</p>
                </div>
                <p className="click-here" onClick={() => window.location.href = '/login'}>Already have an account?</p>
            </div>
            </div>
        </>
  );
}

export default Register;
