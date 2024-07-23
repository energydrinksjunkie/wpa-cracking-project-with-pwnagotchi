import './Handshakes.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const { REACT_APP_BACKEND_URL } = process.env;


const ITEMS_PER_PAGE = 10;

function HandshakeList() {
  const [handshakes, setHandshakes] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copySuccess, setCopySuccess] = useState('');

  const handshake_url = REACT_APP_BACKEND_URL+'/handshake/browser';
  const key_url = REACT_APP_BACKEND_URL+'/auth/api_key';
  const handshakeExportUrl = REACT_APP_BACKEND_URL+'/handshake';

  useEffect(() => {
    const fetchHandshakes = async () => {
      try {
        const response = await axios.get(handshake_url, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setHandshakes(response.data);
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
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
        window.location.href = '/login';
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

  
  const exportHandshakes = async () => {
    try {
        const response = await axios.get(handshakeExportUrl, {
            headers: { 'api_key': apiKey },
            responseType: 'text'
        });

        const blob = new Blob([response.data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cracked.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting handshakes:', error);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHandshakes = handshakes.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <h2>Handshake List</h2>
      <table border={1}>
        <thead>
          <tr>
            <th>Status</th>
            <th>SSID</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {paginatedHandshakes.map((handshake) => (
            <tr key={handshake._id} className={getStatusClassName(handshake.status)}>
              <td>{handshake.status}</td>
              <td>{handshake.ssid}</td>
              <td>{handshake.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={index + 1 === currentPage ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button onClick={exportHandshakes} className="export-button">Export Handshakes</button>
      <p>
        Your API key is: <strong>{apiKey}</strong>
        <button onClick={copyToClipboard} className="copy-button">Copy</button>
      </p>
      {copySuccess && <p className="copy-success">{copySuccess}</p>}
    </>
  );
}

export default HandshakeList;