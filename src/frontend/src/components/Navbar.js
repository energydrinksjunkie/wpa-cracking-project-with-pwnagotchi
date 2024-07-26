import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Navbar.css';

const { REACT_APP_BACKEND_URL } = process.env;

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await axios.get(`${REACT_APP_BACKEND_URL}/auth/session`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <>
        <nav className="navbar">
        <Link to="/" className="navbar-brand">
<pre> __      __                                                     </pre>
<pre>/\ \  __/\ \  __               /'\_/`\                          </pre>
<pre>\ \ \/\ \ \ \/\_\  _ __    __ /\      \     __    ____    ____  </pre>
<pre> \ \ \ \ \ \ \/\ \/\`'__\/'__`\ \ \__\ \  /'__`\ /',__\  /',__\ </pre>
<pre>  \ \ \_/ \_\ \ \ \ \ \//\  __/\ \ \_/\ \/\  __//\__, `\/\__, `\</pre>
<pre>   \ `\___x___/\ \_\ \_\\ \____\\ \_\\ \_\ \____\/\____/\/\____/</pre>
<pre>    '\/__//__/  \/_/\/_/ \/____/ \/_/ \/_/\/____/\/___/  \/___/ </pre>                                                      
</Link>
        {isAuthenticated ? (
        <Link onClick={logout} className="navbar-button">
            Logout
        </Link>
        ) : (
        <Link to="/login" className="navbar-button">
            Login
        </Link>
        )}
        </nav>
    </>
  );
}

export default Navbar;