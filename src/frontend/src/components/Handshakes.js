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

  return (
    <div>
      <h2>Handshake List</h2>
      <ul>
        {handshakes.map((handshake) => (
          <li key={handshake._id}>
            {handshake.ssid}: {handshake.password}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HandshakeList;