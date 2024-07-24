import React from 'react';
import './NotFound.css';
import notFoundImage from '../assets/not-found-image.png';

const NotFound = () => {
  return (
    <>
        <div className="not-found-container">
        <img src={notFoundImage} alt="Page Not Found" className="not-found-image" />
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        </div>
    </>
  );
};

export default NotFound;
