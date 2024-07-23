import './Handshakes.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HandshakeList() {
  const [handshakes, setHandshakes] = useState([]);
  const api_url = 'http://localhost:3000/handshake/browser';

  useEffect(() => {
    const fetchHandshakes = async () => {
      try {
        const response = await axios.get(api_url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setHandshakes(response.data);
      } catch (error) {
        console.error('Error fetching handshakes:', error);
      }
    };

    fetchHandshakes();
  }, []);

  const getStatusClassName = (status) => {
    switch (status) {
      case 'Awaiting':
        return 'status-awaiting';
      case 'In progress':
        return 'status-in-progress';
      case 'Cracked':
        return 'status-cracked';
      case 'Exhausted':
        return 'status-exhausted';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  return (
    <>
      <h2>Handshake List</h2>
      <table border={1}>
        <tr>
          <th>Status</th>
          <th>SSID</th>
          <th>Password</th>
        </tr>
        {handshakes.map((handshake) => (
          <tr key={handshake._id} className={getStatusClassName(handshake.status)}>
            <td>
              {handshake.status}
            </td>
            <td>
            {handshake.ssid}
            </td>
            <td>
            {handshake.password}
            </td>
          </tr>
        ))}
      </table>
    </>
  );
}

export default HandshakeList;