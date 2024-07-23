import './Login.css';
import React, { useState } from "react";
import axios from "axios";

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const api_url = 'http://localhost:3000/auth/login';

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
        </>
    );
}

export default Login;