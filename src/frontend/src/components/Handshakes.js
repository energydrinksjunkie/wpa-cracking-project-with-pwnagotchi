import './Handshakes.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HandshakeList() {
  const [handshakes, setHandshakes] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const handshake_url = 'http://localhost:3000/handshake/browser';
  const key_url = 'http://localhost:3000/auth/api_key';

  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    const fetchHandshakes = async () => {
      try {
        const response = await axios.get(handshake_url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setHandshakes(response.data);
      } catch (error) {
        console.error('Error fetching handshakes:', error);
      }
    };

    const fetchApiKey = async () => {
      try {
        const response = await axios.get(key_url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setApiKey(response.data.api_key);
      } catch (error) {
        console.error('Error fetching API key:', error);
      }
    };

    fetchApiKey();
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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey)
      .then(() => {
        setCopySuccess('API key copied to clipboard!');
        setTimeout(() => setCopySuccess(''), 5000);
      })
      .catch((error) => {
        console.error('Failed to copy API key:', error);
        setCopySuccess('Failed to copy API key');
      });
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
      <p>
        Your API key is: <strong>{apiKey}</strong>
        <button onClick={copyToClipboard} className="copy-button">Copy</button>
      </p>
      {copySuccess && <p className="copy-success">{copySuccess}</p>}
    </>
  );
}

export default HandshakeList;