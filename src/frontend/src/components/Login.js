import './Login.css';
import React, { useState } from "react";
import axios from "axios";
const { REACT_APP_BACKEND_URL } = process.env;

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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
            console.error(error);
        }
    };

    return (
            <>
            <div className="login">
                <h1>Login</h1>
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
                <p className="click-here" onClick={() => window.location.href = '/register'}>Don't have an account?</p>
            </div>
        </>
    );
}

export default Login;