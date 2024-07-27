import './Login.css';
import React, { useState } from "react";
import axios from "axios";
import xImg from '../assets/x.png';
import minImg from '../assets/min.png';
import maxImg from '../assets/max.png';
const { REACT_APP_BACKEND_URL } = process.env;

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const api_url = REACT_APP_BACKEND_URL+'/auth/login';

    const handleLogin = async (e) => {
        try {
            const response = await axios.post(api_url, {
                username,
                password
            });
            localStorage.setItem('token', response.data.token);
            window.location.href = '/handshakes';
            console.log(response);
        } catch (error) {
            setError('Invalid username or password');
            setTimeout(() => {
                setError('');
            }, 2000);
            console.error(error);
        }
    };

    return (
            <>
            <div className="window shadow shadowPlus4">
                <div className="window-header">
                    <p className="title">Login</p>
                    <div className="middle"></div>
                    <div className="buttons">
                        <img src={minImg} alt="minimize" className="button" />
                        <img src={maxImg} alt="maximize" className="button" />
                        <img src={xImg} alt="close" className="button" onClick={() => window.location.href = '/'} />
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
                <button onClick={handleLogin}>Login</button>
                <p className='error'>{error}</p>
                </div>
                <p className="click-here" onClick={() => window.location.href = '/register'}>Don't have an account?</p>
            </div>
            </div>
        </>
    );
}

export default Login;