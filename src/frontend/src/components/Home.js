import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <>
        <div className="home-container">
        <p className='title-home'>Welcome to WireMess</p>
        <p className='desc'>
            WireMess is a powerful tool designed to help you analyze and crack WPA handshakes. With its user-friendly interface and advanced capabilities, you can efficiently manage and break through encrypted networks.
        </p>
        <Link to="/login" className="login-link">
            Get Started
        </Link>
        </div>
    </>
  );
};

export default Home;
